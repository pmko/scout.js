//     math.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.math = (function() {
        /**
         * Returns a boolean indicating whether or not a value is within
         * the specified range.
         *
         * @method $.withinRange
         * @param {Number} low_value The inclusive lower boundary.
         * @param {Number} high_value The inclusive upper boundary.
         * @param {Number} currentValue The value to check against.
         * @for Scout
         */
        function withinRange(low_value, high_value, current_value) {
            if ((current_value > low_value && current_value < high_value) ||
                current_value == low_value ||
                current_value == high_value) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Returns a number between minimum and maximum values.
         *
         * @method $.random
         * @param {Number} max The inclusive upper boundary of the random number range.
         * @param {Number} [min] The inclusive lower boundary of the random number range. 0 by default.
         * @for Scout
         */
        function random(max, min) {
            if (max == null) return -1;
            min = min || 0;

            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        var avg = (function() {
            var avg = [];
            function rollingAverage(newValue, length) {
                avg.unshift(newValue);
                avg.length = length;

                var len = avg.length,
                    total = 0,
                    i;
                for (i = 0; i < len; i++) total += avg[i];
                return total / len;
            }

            return rollingAverage;
        })();

        return {
            range: withinRange,
            randomNumber: random,
            rollingAverage: avg
        };
    })();
})(Scout);
