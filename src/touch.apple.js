//     touch.apple.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

$.touch.registerDriver("apple", function($, opts, doc) {
    if(!("ontouchstart" in doc)) return false;
    var state = null;
    function extract(e, start) {
        if(start) {
            for(var i = 0; i < e.changedTouches.length; i++) {
                if(e.changedTouches[i].identifier == start.id) {
                    t = e.changedTouches[i];
                    break;
                }
            }
        }
        else t = e.changedTouches[0];

        if(!t) return;

        var result = {
            target: t.target, screenX: t.screenX, screenY: t.screenY,
            clientX: t.clientX, clientY: t.clientY, distance: 0, id: t.identifier,
            distance: function() { return Math.sqrt(this.distanceSquared); },
            originalEvent: e
        };
        if(start) {
            result.deltaX = result.clientX - start.clientX;
            result.deltaY = result.clientY - start.clientY;
            result.distanceSquared = result.deltaX * result.deltaX + result.deltaY * result.deltaY;
        }
        return result;
    }
    var holdTimer = null;
    function onHold() {
        if(!state) return;
        $(state.start.target).trigger("hold", state.current);
        holdTimer = null;
        state.isHold = true;
    }
    doc.addEventListener("touchstart", function(e) {
        var start = extract(e);
        if(start && e.touches.length == 1) {
            state = { start: extract(e) };
            state.current = state.start;
            $(e.target).trigger("pointerdown", state.start);
            holdTimer = window.setTimeout(onHold, opts.holdTimeout * 1000);
        }
    });
    doc.addEventListener("touchmove", function(e) {
        if(!state || !(state.current = extract(e, state.start))) return;
        if(e.touches.length != 1) {
            state = null;
            return;
        }
        var $el = $(state.start.target);
        $el.trigger("pointermove", state.current);
        if(state.current.distanceSquared >= opts.tapThreshold * opts.tapThreshold) {
            window.clearTimeout(holdTimer);
            holdTimer = null;
        }
        if(state.isDragging || state.current.distanceSquared >= opts.dragThreshold * opts.dragThreshold) {
            $el.trigger(state.isDragging ? "drag" : "dragstart", state.current);
            state.isDragging = true;
            var dx = state.current.deltaX,
                dy = state.current.deltaY;
            var st = opts.swipeThreshold;
            if(!state.swipe && (Math.abs(dx) >= st || Math.abs(dy) >= st)) {
                var mag = state.current.distance();
                dx /= mag;
                dy /= mag;
                var t = opts.swipeTolerance;
                if(dx >= t) state.swipe = "right";
                else if (dx <= -t) state.swipe = "left";
                else if (dy >= t) state.swipe = "down";
                else if (dy <= -t) state.swipe = "up";
                if(state.swipe) {
                    state.current.direction = state.swipe;
                    $el.trigger("swipe", state.current);
                }
            }
        }
    });
    doc.addEventListener("touchend", function(e) {
        if(!state || !(state.current = extract(e, state.start))) return;
        var $el = $(state.start.target);
        if(state.isDragging) $el.trigger("dragend", state.current);
        $el.trigger("pointerup", state.current);
        if(e.touches.length == 0 && state.current.distanceSquared <= opts.tapThreshold * opts.tapThreshold
            && !state.swipe && !state.isHold) {
            $el.trigger("tap", state.current);
        }
        window.clearTimeout(holdTimer);
        holdTimer = null;
        state = null;
    });

    var gstate = null;
    function gextract(e) {
        return { target: e.target, scale: e.scale, rotation: e.rotation };
    }
    doc.addEventListener("gesturestart", function(e) {
        gstate = { start: gextract(e) };
    });
    doc.addEventListener("gesturechange", function(e) {
        if(!gstate) return;
        gstate.current = gextract(e, gstate.start);
        var $el = $(e.target);
        if(gstate.isScaling || Math.abs(gstate.current.scale - 1) >= opts.scaleThreshold) {
            $el.trigger(gstate.isScaling ? "scale" : "scalestart" , gstate.current);
            gstate.isScaling = true;
        }
        if(gstate.isRotating || Math.abs(gstate.current.rotation) >= opts.rotateThreshold) {
            $el.trigger(gstate.isRotating ? "rotate" : "rotatestart", gstate.current);
            gstate.isRotating = true;
        }
    });
    doc.addEventListener("gestureend", function(e) {
        gstate.current = gextract(e, gstate.start);
        var $el = $(e.target);
        if(gstate.isScaling) $el.trigger("scaleend", gstate.current);
        if(gstate.isRotating) $el.trigger("rotateend", gstate.current);
        gstate = null;
    });
    return true;
});
