//     touch.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($, doc, window){
    var settings = {
        tapThreshold: 25,
        dragThreshold: 5,
        swipeThreshold: 50,
        swipeTolerance: 0.85,
        scaleThreshold: 0.05,
        rotateThreshold: 5,
        holdTimeout: 1
    };
    var driverName = null;
    $.touch = {
        /**
         * Set configuration values related to touch support. Available settings are:
         *
         * tapThreshold - The maximum distance a pointer may move and be considered
         *                a tap.
         * dragThreshold - The distance moved before drag events are triggered.
         * swipeThreshold - The distance moved before a swipe event is triggered.
         * swipeTolerance - The minimum dot product between a normalized swipe vector
         *                   and a basis vector to trigger a swipe (higher is less
         *                   tolerant of diagonal swipes; 1 would require a perfect line).
         * scaleThreshold - The minimum delta in % before scale events are triggered.
         * rotateThreshold - The minimum delta in degrees before rotate events are triggered.
         *
         * @param {Object} opts an object containing touch settings
         * @method $.touch.config
         * @for Scout
         */
        config: function(opts) {
            $.extend(settings, opts);
        },
        registerDriver: function(name, callback) {
            if(!driverName && callback($, settings, doc, window)) {
                driverName = name;
            }
        },
        driver: function() {
            return driverName;
        },
        isMultiTouch: function() {
            switch(this.driver()) {
                case "mouse":
                    return false;
                case "msft":
                    return window.navigator.msMaxTouchPoints >= 2;
                default:
                    return true;
            };
        }
    };
    function cancel(e) {
        if(e && typeof e.preventDefault === "function") e.preventDefault();
    }
    /**
     * Disable the native touch scrolling and navigating behavior on
     * the elements. This is often needed when apps want to capture
     * gestures.
     *
     * @method .disableTouchScroll
     * @for Scout
     */
    $.fn.disableTouchScroll = function() {
        this.each(function(el) {
            el.addEventListener("touchmove", cancel);
        });
        this.css("-ms-touch-action", "none");
    }
    /**
     * Re-enable native touch behaviors after a call to .disableTouchScroll()
     *
     * @method .enableTouchScroll
     * @for Scout
     */
    $.fn.enableTouchScroll = function() {
        this.each(function(el) {
            el.removeEventListener("touchmove", cancel);
        });
        $el.css("-ms-touch-action", "auto");
    }
    $.register();
})(Scout, document, window);
