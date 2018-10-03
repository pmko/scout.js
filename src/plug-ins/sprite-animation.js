//     sprite-animation.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function(exports) {
    var extend = function($) {
        $.fn.animateSprite = function(params) {
            return this.each.call(this, function(val, index, array) {
                val._animateSprite = (function() {
                    var defaultParams = {
                        increment: 0, // width or height to shift, will default to el dimensions and axis setting
                        axis: 'x', // x || y
                        steps: 1, // minimum steps is 1
                        delay: 0, // not required
                        loop: 0, //0=infinate
                        framerate: 40,
                        complete: function() {}
                    },
                    stepCount = 0,
                    loopCount = 0,
                    el = val,
                    p,
                    intID,
                    pos;

                    params = params || defaultParams;
                    p = $.automap(defaultParams, params);

                    if (p.increment == 0) { //set to element dimensions
                        switch (p.axis) {
                            case 'x':
                                p.increment = $(el).width();
                                break;
                            case 'y':
                                p.increment = $(el).height();
                                break;
                        }
                    }

                    function resetLoop() {
                        stepCount = 0;
                        ++loopCount;
                    }

                    function stop() {
                        clearInterval(intID);
                    }

                    function reset() {
                        stepCount = loopCount = 0;
                    }

                    function complete() {
                        reset();
                        animParams.complete();
                    }

                    function start() {
                        intID = setInterval(function() {
                            if (stepCount > p.steps) (p.loop == 0) ? stepCount = 0 : (loopCount < p.loop) ? resetLoop() : complete();
                            pos = String(stepCount * p.increment * -1);
                            $(el).css('background-position', p.axis == 'x' ? pos + 'px 0px' : '0px ' + pos + 'px');
                            ++stepCount;
                        },p.framerate);
                    }

                    function togglePlayback() {
                        if (intID) stop();
                        else start();
                    }

                    function stopAndReset() {
                        stop();
                        reset();
                    }

                    function resetToDefaults() {
                        reset();
                    }

                    return {
                        start: start,
                        toggle: togglePlayback,
                        stop: stopAndReset,
                        reset: resetToDefaults
                    };
                })();

                params.delay > 0 ? setTimeout(function() {val._animateSprite.start.call(val)},params.delay * 1000) : val._animateSprite.start.call(val);
            });
        };

        $.register();
    }

    extend(exports.Scout);
})(window);
