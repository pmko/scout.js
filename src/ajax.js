//     ajax.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function(exports) {
    var extend = function($) {
        $.ajax = function(url, options) {
            var xhr = new XMLHttpRequest(),
                defaultOptions = {
                    url: null,
                    context: xhr,
                    method: "GET",
                    headers: {},
                    responseType: "json",
                    data: null,
                    timeout: 0,
                    progress: function() {},
                    timeoutHandler: function() {},
                    complete: function() {},
                    error: function() {}
                },
                isCORS = false,
                xhrTimeout,
                p;

            if (typeof url === "string") {
                defaultOptions.url = url;
            } else if (typeof url === "object") {
                options = url;
            }

            defaultOptions.headers["Accept"] = "*/*";
            defaultOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
            defaultOptions.headers["X-Requested-With"] = "XMLHttpRequest";

            options = options || defaultOptions;
            options = $.automap(defaultOptions, options);

            if (options.url === null) throw new Error("no url was provided for ajax call");

            //check for CORS request
            if (options.url.indexOf(window.location.hostname) > -1) isCORS = true;

            var deferred = new $.Deferred();

            //https://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
            if (!("withCredentials" in xhr) && window.XDomainRequest && isCORS) {
                xhr = new XDomainRequest();
                if (xhr) {
                    xhr.onload = function() {
                        deferred.resolve(xhr.responseText, xhr.statusText, xhr);
                        options.complete.call(options.context, xhr.responseText);
                    };
                    xhr.onerror = function() {
                        deferred.reject(xhr, xhr.statusText);
                        options.error.call(options.context, "", new Error("unable to make xhr request."));
                    };
                    xhr.onprogress = options.progress;
                    xhr.timeout = options.timeout;
                    xhr.open(options.method, url);
                } else {
                    options.error.call(options.context, "", new Error("unable to make xhr request."));
                }
            } else {
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) return;

                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                        deferred.resolve(xhr.responseText, xhr.statusText, xhr);
                        options.complete.call(options.context, xhr.responseText, xhr.getResponseHeader("Content-Type"));
                    } else if (xhr.status == 404 || xhr.status == 500) {
                        deferred.reject(xhr, xhr.statusText);
                        options.complete.call(options.context, xhr.responseText, new Error(xhr.status));
                    }
                }

                xhr.onprogress = options.progress;

                xhr.open(options.method, options.url, true);
                xhr.timeout = options.timeout;

                if (options.method == "POST") {
                    var headers = options.headers;
                    for (p in headers) {
                        xhr.setRequestHeader(p, headers[p]);
                    }
                }
            }
            //TODO - automatically handle data when request is a GET
            xhr.send(options.method == "POST" ? options.data : null);

            if (options.timeout > 0) {
                xhrTimeout = setTimeout(timeoutHandler, options.timeout);
            }

            return deferred.promise(xhr);
        }
    }

    extend(exports.Scout);
})(window);
