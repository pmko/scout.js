//     animation.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    var transitionEnd = "transitionend",
        style = $.vendorStyle("transition");

    switch(style) {
        case "-webkit-transition":
            transitionEnd = "webkitTransitionEnd";
            break;
        case "-ms-transition":
            transitionEnd = "MSTransitionEnd";
            break;
    }

    $.fn.animate = function(properties, duration, options) {
        var defaultOptions = {
            ease: 'ease-out',
            delay: 0,
            complete: function() {}
        },
        clear = {};

        clear['transition-property'] = '';
        clear['transition-duration'] = '';
        clear['transition-timing-function'] = '';
        clear['transition-delay'] = '';
        clear['animation-name'] = '';
        clear['animation-duration'] = '';

        duration = duration || 0.3;
        options = options || defaultOptions;
        options = $.automap(defaultOptions, options);

        var _d = "_defer";
        var defer = new $.Deferred();
        this.each(function(val) {
            var dd = $.data(val, _d) || $.data(val, _d, {});
            dd = (dd["fx"] = dd["fx"] || []);
            dd.push(defer);
        });

        $.defer(this, exec);
        function exec() {
            var count = this.length;
            var c = this;
            this.each(function(val, index, array) {
				var timeout;
				eventHandler = function(evt) {
					clearTimeout(timeout);
					if (evt) evt.stopPropagation();
                    this.removeEventListener(transitionEnd, eventHandler, false);
                    $(val).css(clear);
                    var dd = $.data(val, _d)["fx"];
                    dd.splice(dd.indexOf(defer), 1);
                    if(--count == 0) {
                        defer.resolve(c);
                        options.complete.call(val);
                    }
                };
                val.addEventListener(transitionEnd, eventHandler, false);

                var transOptions = ' ' + duration + 's ' + options.ease + ' ' + options.delay + 's',
                    newProps = [],
                    eventHandler;
                newProps['transition'] = 'all' + transOptions;
                for(var prop in properties) newProps[prop] = properties[prop];
                $(val).css(newProps);

				timeout = setTimeout(eventHandler,(duration+options.delay+0.2)*1000);
            });
        }
        return defer;
    }
})(Scout);
