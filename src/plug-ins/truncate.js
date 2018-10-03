//     truncate.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function(exports) {
    var extend = function($) {
        $.fn.truncate = function() {
            return this.each.call(this, function(val, index, array) {
                var ph = $(val).parent().height();

                function shortenText() {
                    $(val).text(function(index, text) {
                        return text.replace(/\W*\s(\S)*$/, '...');
                    });

                    $.defer(this, function() {
                        if ($(val).height() > ph) shortenText();
                    });
                }

                if ($(val).height() > ph) shortenText();
            });
        };

        $.register();
    }

    extend(exports.Scout);
})(window);
