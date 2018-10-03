//     uuid.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.uuid = function() {
        var uuid = [];
        var chars = String('0123456789ABCDEF').split('');
        var reserved = String('89ab').split('');

        for (var i = 0; i < 36; i++) {
            uuid[i] = chars[Math.floor(Math.random() * 15)];
        }

        uuid[14] = 4;
        uuid[19] = reserved[Math.floor(Math.random() * 3)];

        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        return uuid.join('');
    };
})(Scout);
