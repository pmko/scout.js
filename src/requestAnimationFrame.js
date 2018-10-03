//     requestAnimationFrame.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function(window) {
    var prefixes = ['ms', 'moz', 'webkit', 'o'];

    // Loops through vendor-specific prefixes to find an existing
    // implementation of RequestAnimationFrame.
    for (var i = 0; i < prefixes.length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[prefixes[i] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[prefixes[i] + 'CancelAnimationFrame'] ||
            window[prefixes[i] + 'CancelRequestAnimationFrame'];
    }

    // Shim implementation for request and cancel animation frame
    // if no browser implementation was found.
    if (!window.requestAnimationFrame) {
        var lastUpdated = 0;
        window.requestAnimationFrame = function(callback) {
            var currentTime = new Date().getTime();
            var tickDuration = Math.max(0, 16 - (currentTime - lastUpdated));
            lastUpdated = currentTime + tickDuration;

            return setTimeout(function() { callback(currentTime + tickDuration); }, tickDuration);
        }
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(a) {
            clearTimeout(a);
        }
    }

    return {
        success: true
    }
})(window);
