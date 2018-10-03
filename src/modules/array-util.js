//     array-util.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.arrayUtil = (function() {
        function iobpv(arr, prop, value, offset) {
            var i;
            offset = offset || 0;
            for (i = 0 + offset; i < arr.length; i++) {
                if (arr[i][prop] == value) return i;
            }
            return -1;
        }

        function gibpv(arr, prop, value) {
            return arr[iobpv(arr, prop, value)] || undefined;
        }

        function al(arr) {
            var i,
                length = 0;
            for (i in arr) length++;
            return length;
        }

        return {
            indexOfByPropValue: iobpv,
            getItemByPropValue: gibpv,
            associativeLength: al
        };
    })();
})(Scout);
