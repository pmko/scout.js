//     event.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.trigger = function(el, type, args, opts) {
        args = args || {};
        opts = opts || {bubbles: true, cancelable: true};
        var e;

        if(document.createEvent) {
            e = document.createEvent("Event");
            e.initEvent(type, opts.bubbles, opts.cancelable);
            $.extend(e, args);
            el.dispatchEvent(e);
        }
    };

    /**
     * Trigger a named event with optional arguments. By default, the
     * event will bubble up and is cancelable.
     *
     * @param {String} type the event type name (e.g., "click")
     * @param {String} [args] an args object to be merged with the event arguments
     * @param {Object} [opts] the value or reference to be stored
     * @return {Object} returns this
     * @method .trigger
     * @for Scout
     */
    $.fn.trigger = function(type, args, opts) {
        this.each(function(el) {
            $.trigger(el, type, args, opts);
        });
        return this;
    };
    /**
     * Add an event handler for a named event type.
     *
     * @param {String} type the event type name (e.g., "click")
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .bind
     * @for Scout
     */
    $.fn.bind = function(type, callback) {
        this.each(function(el) {
            el.addEventListener(type, callback);
        });
        return this;
    }
    /**
     * Remove an existing event handler.
     *
     * @param {String} type the event type name
     * @param {Function} [callback] the previously-added event handler
     * @return {Object} returns this
     * @method .unbind
     * @for Scout
     */
    $.fn.unbind = function(type, callback) {
        this.each(function(el) {
            el.removeEventListener(type, callback);
        });
        return this;
    }
    /**
     * Add an event handler.
     *
     * @param {String} type the event type name
     * @param {String} [selector] a selector, specifying other elements to delegate the event to
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .on
     * @for Scout
     */
    $.fn.on = function(type, selector, callback) {
        if(typeof selector === "string") {
            this.delegate(selector, type, callback);
        } else {
            this.bind(type, selector);
        }
		return this;
    };
    /**
     * Add an event handler to be executed once. Works exactly like .on() except the handler
     * is removed immediately after its first invocation.
     *
     * @param {String} type the event type name
     * @param {String} [selector] a selector, specifying other elements to delegate the event to
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .on
     * @for Scout
     */
    $.fn.one = function(type, selector, callback) {
        var c = this;
        var wrapper = function(e) {
            callback(e);
            c.off(type, selector, wrapper);
        }
        if(typeof selector === "string") {
            return c.on(type, selector, wrapper);
        } else {
            callback = selector;
            selector = wrapper;
            return c.on(type, wrapper);
        }
    }
    /**
     * Remove an existing event handler.
     *
     * @param {String} type the event type name
     * @param {String} [selector] the delegate selector, if preivously provided
     * @param {Function} [callback] the previously-added event handler
     * @return {Object} returns this
     * @method .off
     * @for Scout
     */
    $.fn.off = function(type, selector, callback) {
        if(typeof selector === "string") {
            this.undelegate(selector, type, callback);
        } else {
            callback = selector;
            this.unbind(type, callback);
        }
		return this;
    };
    var _d = "_delegate";
    /**
     * Add an event handler that fires when another element, specified by the selector,
     * triggers that event. The callback is called in the context of the element
     * matching the selector.
     *
     * @param {String} [selector] the delegate selector
     * @param {String} type the event type name
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .delegate
     * @for Scout
     */
    $.fn.delegate = function(selector, type, callback) {
        var $c = this;
        this.each(function(el) {
            var dd = $.data(el, _d) || $.data(el, _d, []);
            var delegate = function(e) {
                var $el = $c.find(selector);
                if($el.indexOf(e.target) >= 0) {
                    callback.call(e.target, e);
                }
            };
            dd.push({sel:selector, cb:callback, d: delegate});
            el.addEventListener(type, delegate);
        });
        return this;
    };
    /**
     * Remove a previously-subscribed delegate event handler.
     *
     * @param {String} [selector] the delegate selector
     * @param {String} type the event type name
     * @param {Function} [callback] the previously-added event handler
     * @return {Object} returns this
     * @method .delegate
     * @for Scout
     */
    $.fn.undelegate = function(selector, type, callback) {
        this.each(function(el) {
            var dd = $.data(el, _d);
            if(dd) {
                for(var i = 0; i < dd.length; i++) {
                    if(dd[i].sel === selector && dd[i].cb === callback) {
                        el.removeEventListener(type, dd[i].d);
                        dd.splice(i, 1);
                        return;
                    }
                }
            }
        });
        return this;
    };

    $.register();
})(Scout);
