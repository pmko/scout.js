//     touch.mouse.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

$.touch.registerDriver("mouse", function($, opts, doc) {
    if(!("onmousedown" in doc)) return false;
    var state = null;
    function extract(e, start) {
        var result = {
            target: e.target, screenX: e.screenX, screenY: e.screenY,
            clientX: e.clientX, clientY: e.clientY, distanceSquared: 0,
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
        window.clearTimeout(holdTimer);
        holdTimer = null;
        state.isHold = true;
    }
    doc.addEventListener("mousedown", function(e) {
        state = { start: extract(e) };
        state.current = state.start;
        $(e.target).trigger("pointerdown", state.start);
        holdTimer = window.setTimeout(onHold, opts.holdTimeout * 1000);
    });
    doc.addEventListener("mousemove", function(e) {
        if(!state) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        $el.trigger("pointermove", state.current);
        if(holdTimer && state.current.distanceSquared >= opts.tapThreshold * opts.tapThreshold) {
            window.clearTimeout(holdTimer);
            holdTimer = null;
        }
        if(state.isDragging || state.current.distanceSquared > opts.dragThreshold * opts.dragThreshold) {
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
    doc.addEventListener("mouseup", function(e) {
        if(!state) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        if(state.isDragging) $el.trigger("dragend", state.current);
        $el.trigger("pointerup", state.current);
        if(state.start.target === e.target && !state.swipe && !state.isHold)
            $el.trigger("tap", state.current);
        if(holdTimer) {
            window.clearTimeout(holdTimer);
            holdTimer = null;
        }
        state = null;
    });
    return true;
});
