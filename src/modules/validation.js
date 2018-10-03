//     validation.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.validator = (function() {
        return {
            string: function(val, len) {
                var regex = /^[\s]+/,
                    status = true,
                    len = len || val.length;

                if (regex.test(val) || val.length < len) status = false;

                return status;
            },
            integer: function(val) {
                var regex = /^\d+$/,
                    num = val.replace(',', '');
                return regex.test(num);
            },
            range: function(low_value, high_value, current_value) {
                if ((current_value > low_value && current_value < high_value) || current_value == low_value || current_value == high_value) return true;
                else return false;
            },
            name: function(val) {
                var regex = /[0-9a-zA-Z-_\.]+/;
                return regex.test(val);
            },
            fullname: function(val) {
                var regex = /[0-9a-zA-Z-_\.]+(\s[0-9a-zA-Z-_\.]+)+/;
                return regex.test(val);
            },
            filePath: function(val) {
                var regex = /http:\/\/[A-Za-z0-9\.-]{3,}(\.[A-Za-z]{2,4})?(:[0-9]+)?(\/[a-zA-Z0-9_-]+)+(\.[a-zA-Z]{3})?(\?[a-zA-Z0-9=\-+_]+)?/;
                return regex.test(val);
            },
            email: function(val) {
                var regex = /^([a-zA-Z0-9]+|[a-zA-Z0-9][\w.-]+)@([a-zA-Z0-9]+|\w[\w.-]+)\.[\w.-]*[a-zA-Z0-9][a-zA-Z0-9]$/i;
                return regex.test(val);
            },
            phone: function(val) {
                //based on NANP, http://en.wikipedia.org/wiki/North_American_Numbering_Plan
                var regex = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
                return regex.test(val);
            },
            zipcode: function(val) {
                var regex = /^\d{5}(-\d{4})?$/;
                return regex.test(val);
            },
            date: function(val) {
                var date = new Date(val);
                if (Object.prototype.toString.call(date) !== '[object Date]')
                    return false;
                return !isNaN(date.getTime());
            }
        };
    })();
})(Scout);
