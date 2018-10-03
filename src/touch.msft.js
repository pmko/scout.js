//     touch.msft.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

$.touch.registerDriver("msft", function($, opts, doc, window) {
    if(!("onmspointerdown" in doc) || !("MSGesture" in window)) return false;
    var state = null,
        gesture = null,
        gestureEvents = ["MSGestureTap","MSGestureHold","MSGestureStart","MSGestureChange"],
        gcount = 0;
    function extract(e, start) {
        var result = {
            target: e.target, screenX: e.screenX, screenY: e.screenY,
            clientX: e.clientX, clientY: e.clientY, distance: 0, id: e.pointerId,
            deltaX: 0, deltaY: 0, distanceSquared: 0,
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
    var radToDeg = 180 / Math.PI;
    function gextract(e, cur) {
        var dx = e.translationX,
            dy = e.translationY;
        cur.deltaX += dx;
        cur.deltaY += dy;
        cur.screenX += dx;
        cur.screenY += dy;
        cur.clientX += dx;
        cur.clientY += dy;
        cur.distanceSquared = cur.deltaX * cur.deltaX + cur.deltaY * cur.deltaY;
        cur.scale *= e.scale;
        cur.rotation += e.rotation * radToDeg;
        return cur;
    }
    function onGesture(e) {
        if(!state) return;
        state.gesture && (state.gesture = gextract(e, state.gesture));
        var g = state.gesture;
        var $el = $(state.start.target);
        switch(e.type) {
            case "MSGestureStart":
                g = state.gesture = {scale: 1, rotation: 0};
                $.extend(g, state.current);
                break;
            case "MSGestureTap":
                $el.trigger("tap", state.start);
                endGesture();
                break;
            case "MSGestureHold":
                $el.trigger("hold", state.start);
                endGesture();
                break;
            case "MSGestureChange":
                var dx = g.deltaX,
                    dy = g.deltaY,
                    st = opts.swipeThreshold;
                if(!state.isScaling && !state.isRotating && !state.swipe && gcount == 1
                        && (Math.abs(dx) >= st || Math.abs(dy) >= st)) {
                    var mag = g.distance();
                    dx /= mag;
                    dy /= mag;
                    var t = opts.swipeTolerance;
                    if(dx >= t) state.swipe = "right";
                    else if (dx <= -t) state.swipe = "left";
                    else if (dy >= t) state.swipe = "down";
                    else if (dy <= -t) state.swipe = "up";
                    if(state.swipe) {
                        g.direction = state.swipe;
                        $el.trigger("swipe", g);
                        endGesture();
                    }
                }
                if(state.isRotating || Math.abs(g.rotation) >= opts.rotateThreshold) {
                    $el.trigger(state.isRotating ? "rotate" : "rotatestart", g);
                    state.isRotating = true;
                }
                if(state.isScaling || Math.abs(g.scale - 1) >= opts.scaleThreshold) {
                    $el.trigger(state.isScaling ? "scale" : "scalestart", g);
                    state.isScaling = true;
                }
                break;
        }
    }
    function endGesture() {
        if(gesture) {
            gesture.stop();
            for(var i in gestureEvents) {
                doc.removeEventListener(gestureEvents[i], onGesture);
                gesture.target.removeEventListener(gestureEvents[i], onGesture);
            }
            gesture = null;
            gcount = 0;
        }
    }
    doc.addEventListener("MSPointerDown", function(e) {
        state = { start: extract(e) };
        state.current = state.start;
        $(e.target).trigger("pointerdown", state.start);
        if(!gesture) {
            gesture = new MSGesture();
            // gestures must be tracked at the body level so that transformed
            // elements don't mess up pointer tracking
            gesture.target = doc.body;
            for(var i in gestureEvents) {
                gesture.target.addEventListener(gestureEvents[i], onGesture);
            }
        }
        gcount++;
        gesture.addPointer(e.pointerId);
    });
    doc.addEventListener("MSPointerMove", function(e) {
        if(!state || e.pointerId != state.start.id) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        $el.trigger("pointermove", state.current);
        if(state.isDragging || state.current.distanceSquared > opts.dragThreshold * opts.dragThreshold) {
            state.isDragging = true;
            $el.trigger(state.isDragging ? "drag" : "dragstart", state.current);
            var dx = state.current.deltaX,
                dy = state.current.deltaY;
            var st = opts.swipeThreshold;
        }
    });
    doc.addEventListener("MSPointerUp", function(e) {
        if(!state) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        if(state.isDragging) $el.trigger("dragend", state.current);
        if(state.isRotating) $el.trigger("rotateend", state.current);
        if(state.isScaling) $el.trigger("scaleend", state.current);
        $el.trigger("pointerup", state.current);
        endGesture();
        state = null;
    });
    return true;
});
