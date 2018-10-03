//     date.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.date = (function() {
        var short_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'],
            days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            short_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        function getDays() {
            return days;
        }

        function getShortDays() {
            return short_days;
        }

        function getMonths() {
            return months;
        }

        function getShortMonths() {
            return short_months;
        }

        function getDay(d, s) {
            return (s) ? short_days[d] : days[d];
        }

        function getMonth(m, s) {
            return (s) ? short_months[m] : months[m];
        }

        return {
            getDays: getDays,
            getShortDays: getShortDays,
            getMonths: getMonths,
            getShortMonths: getShortMonths,
            getDay: getDay,
            getMonth: getMonth
        };
    })();
})(Scout);
