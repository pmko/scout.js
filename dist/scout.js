



(function(exports) {
    var scout = function() {
        var a = [],
          b = "boolean",
          d = document,
          f = "function",
          n = "number",
          o = "object",
          s = "string",
          u = "undefined",
          w = window,
          i = 0;

        
        function Scout() {};
        Scout.prototype = new Array;

        function S(elements) {
            elements = elements || [];

            var s = new Scout();
            s.concat(elements);

            return s;
        }

        
        function $(selector, context) {
            var elements = [];
            context = context || document;

            if (typeof selector === u) {
                return S(elements);
            } else if (typeof selector === s) { 
                
                if (/^\s*<(\w+)[^>]*>/.test(selector))
                    elements = createFragment(selector);
                else
                    elements = selectorEngine(context, selector);
            } else if (typeof selector === f) {
                $.fn.ready(selector);
            } else if (selector instanceof Array) {
                
                if (selector.ready) return selector;

                
                if (selector.every(function(el) { return typeof el === s })) {
                    
                    for (i = 0; i < selector.length; i++)
                        elements = elements.concat(
                            selectorEngine(context, selector[i])
                            );
                } else if (selector.every(function(el) { return typeof el === o })) {
                    return S(selector);
                } else if (selector.length == 2 &&
                    selector.every(function(p) { return typeof p === n })) {
                    
                    elements = d.elementFromPoint(selector[0], selector[1]);
                }
            } else if (selector.nodeType == 1 ||
                selector.nodeType == 3 ||
                selector.nodeType == 9 ||
                selector === w) {
                
                elements = [selector];
            }

            return S(elements);
        }

        $.VERSION = "1.0.0";

        function selectorEngine(element, selector) {
            var result;
            
            
            if (/^\.([\w\-]+)$/.test(selector)) { 
                result = element.getElementsByClassName(RegExp.$1);
            } else if (/^#([\w\-]+)$/.test(selector)) { 
                result = d.getElementById(RegExp.$1);
                return result ? [result] : [];
            } else if (/^[\w]+$/.test(selector)) { 
                result = element.getElementsByTagName(selector);
            } else { 
                result = element.querySelectorAll(selector);
            }

            return toArray(result);
        }

        
        function toArray(nl) {
            var arr = [];
            for (var i = nl.length; i--; arr.unshift(nl[i])) {}
            return arr;
        }

        
        function createFragment(html) {
            var fragment = d.createElement("div");
            fragment.insertAdjacentHTML("beforeend", html);
            return a.slice.call(toArray(fragment.childNodes), 0);
        }

        
        function renderArg(thisobj, arg, index, currVal) {
            return (typeof arg === f) ? arg.call(thisobj, index, currVal) : arg;
        }

        
        $.extend = function extendObj(deep, dest, src, rm) {
            if(deep !== true) {
                rm = src;
                src = dest;
                dest = deep;
                deep = false;
            }
            if (!src) {
                return null;
            }

            for (var prop in src) {
                if (deep && typeof src[prop] === o && src[prop] !== null) {
                    dest[prop] = dest[prop] || {};
                    
                    extendObj(dest[prop], src[prop]);
                } else {
                    dest[prop] = src[prop];
                }
            }

            if (rm) {
                for (var i = 0; i < rm.length; i++) {
                    delete dest[rm[i]];
                }
            }

            return dest;
        }

        
        $.register = function(module) {
            module = module || $.fn;
            $.extend(Scout.prototype, module);
        };

        function getData(el) {
            var d = "_data";
            if(typeof el[d] !== "object") {
                Object.defineProperty(el, d, {value: {}});
            }
            return el[d];
        }

        
        $.data = function(el, key, value) {
            var d = getData(el);
            if(typeof key === u) {
                return d;
            }
            else if(typeof value === u) {
                var v = d[key];
                if(typeof v === u) {
                    v = el.getAttribute("data-"+key);
                    return v === null ? undefined : v;
                }
                return v;
            } else {
                d[key] = value;
                return value;
            }
        }

        
        $.removeData = function(el, key) {
            var d = getData(el);
            if(typeof key === u) {
                for(var i in d) {
                    delete d[i];
                }
            } else {
                delete d[key];
            }
        }

        
        $.inArray = function(val, arr) {
            return arr.indexOf(val);
        }

        
        $.automap = function(map, src) {
            if (arguments.length !== 2) return;
            var result = {};
            
            var prop;
            for (prop in src) {
                if (map.hasOwnProperty(prop)) {
                    result[prop] = src[prop];
                }
            }
            for (prop in map) {
                if (!result.hasOwnProperty(prop)) {
                    result[prop] = map[prop];
                }
            }

            return result;
        };

        
        $.log = function(msg, force) {
            force = force || false;
            if (typeof console === "undefined" || force) { 
                $("p.log-output").append(msg + "<br/>");
            } else if (typeof console.log === "function") {
                console.log.call(console, msg);
            } else { 
                Function.prototype.bind.call(console.log, console).call(console, msg);
            }
        };

        $.defer = (function() {
            var deferred = [],
                msgId = "defer-msg";

            function defer(context, fn, args) {
                deferred.push({ctx: context, f: fn, a: args});
                window.postMessage(msgId, "*");
            }

            function deferHandler(evt) {
                if (evt.data == msgId) {
                    evt.stopPropagation();
                    if (deferred.length > 0) {
                        var d = deferred.shift();
                        d.a = d.a || [];
                        d.f.apply(d.ctx, d.a);
                    }
                }
            }

            window.addEventListener("message", deferHandler, true);
            return defer;
        })();

        $.vendorStyle = (function(){
            var cache = {},
                div = document.createElement("div"),
                computedStyle = window.getComputedStyle(div),
                prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
            div = null;
            function getPrefix(style) {
                if(cache[style]) return cache[style];
                for(var i = 0; i < prefixes.length; i++) {
                    var pstyle = prefixes[i]+style;
                    if(typeof computedStyle[pstyle] !== u) {
                        cache[style] = pstyle;
                        return pstyle;
                    }
                }
                return style;
            }
            return getPrefix;
        })();

        var stylesUsingNumbers = {
            "column-count": true,
            "fill-opacity": true,
            "font-weight": true,
            "opacity": true,
            "orphans": true,
            "widows": true,
            "z-index": true,
            "zoom": true
        };

        $.fn = {
            
            ready: function(callback) {
                var rs = "readyState",
                    rsc = "readystatechange",
                    dcl = "DOMContentLoaded";

                function loaded() {
                    return /complete|loaded/.test(d[rs]);
                }

                function handler(e) {
                    if (loaded()) {
                        d.removeEventListener(dcl, handler, false);
                        d.removeEventListener(rsc, handler, false);
                        callback($);
                    }
                }

                if (loaded()) { callback($);
                } else {
                    d.addEventListener(dcl, handler, false);
                    d.addEventListener(rsc, handler, false);
                }
                return this;
            },
            
            each: function(func) {
                
                
                
                this.forEach(function(val, index, array) {
                    func.call(val, val, index, array);
                });
                return this;
            },
            
            concat: function() {
                var i;
                for (i = 0; i < arguments.length; i++) {
                    var n,
                        t = arguments[i];
                    if (t instanceof Array) {
                        for (n = 0; n < t.length; n++) {
                            this.push(t[n]);
                        }
                    } else {
                        this.push(t);
                    }
                }
                return this;
            },
            
            data: function(key, value) {
                if(typeof key === o) {
                    for(var i in key) {
                        this.data(i, key[i]);
                    }
                } else if (typeof value === u) {
                    return this.length > 0 ? $.data(this[0], key) : null;
                } else {
                    this.each(function(e) {
                        $.data(e, key, value);
                    });
                }
                return value;
            },
            
            removeData: function() {
                var args = arguments[0] instanceof Array ? arguments[0] : arguments;
                if(args.length == 0) {
                    this.each(function(e) {
                        $.removeData(e);
                    });
                } else {
                    for(var i = 0; i < args.length; i++) {
                        this.each(function(e) {
                            $.removeData(e, args[i]);
                        });
                    }
                }
                return this;
            },
            
            filter: function(func) {
                return $(filtered = a.filter.call(this, func));
            },
            
            join: function(separator, attr) {
                if (typeof attr === u) {
                    return a.join.call(this, separator || ",");
                } else {
                    var str = "";
                    this.forEach(function(val, index, array) {
                        str += $(val).attr(attr) + (separator || ",");
                    });
                    return str.substr(0, str.length - 1);
                }
            },
            
            lastIndexOf: function(searchElement) {
                var t;
                if (typeof searchElement === u) {
                    return u;
                } else {
                    return a.lastIndexOf.call(
                        this,
                        (t = $(searchElement))[t.length - 1]);
                }
            },
            map: function(func, thisArg) {
                var results = [], i;
                for (i = 0; i < this.length; i++) {
                    var val = func.call(thisArg || this, this[i]);
                    if (val) results.push(val);
                }
                return S(results);
            },
            pop: function() {
                var t = a.pop.call(this);
                return S([t]);
            },
            push: function() {
                var i, n, s;
                for (i = 0; i < arguments.length; i++) {
                    s = arguments[i];
                    if (s instanceof Array) {
                        for (n = 0; n < s.length; n++) {
                            a.push.call(this, s[n]);
                        }
                    } else {
                        a.push.call(this, s);
                    }
                }

                return this.length;
            },
            scrollLeft: function(value) {
                if(typeof value === u) return this[0].scrollLeft;
                this[0].scrollLeft = value;
            },
            scrollTop: function(value) {
               if(typeof value === u) return this[0].scrollTop;
               this[0].scrollTop = value;
            },
            shift: function() {
                var t = a.shift.call(this);
                return S([t]);
            },
            slice: function(begin, end) {
                return S(a.slice.call(this, begin, end || this.length));
            },
            splice: function() {
                var index = arguments[0],
                    num = arguments[1],
                    add = toArray(arguments).slice(2),
                    removed = a.splice.call(this, index, num),
                    i;
                add = add.length == 1 && add[0].length && add[0];
                if (add.length > 0) {
                    for (i = add.length - 1; i >= 0; i--) {
                        a.splice.call(this, index, 0, add[i]);
                    }
                }
                return S(removed);
            },
            unshift: function() {
                var i, n, s;
                for (i = 0; i < arguments.length; i++) {
                    s = arguments[i];
                    if (s instanceof Array) {
                        for (n = 0; n < s.length; n++) {
                            a.unshift.call(this, s[n]);
                        }
                    } else {
                        a.unshift.call(this, s);
                    }
                }

                return this.length;
            },
            
            attr: function(name, value) {
                if (this.length == 0) return undefined;

                if (typeof name === s && typeof value === u) {
                    
                    var val = this[0].getAttribute(name);
                    if (val == null) return undefined;

                    if (val.charAt(0) == "{" || val.charAt(0) == "[") {
                        try {
                            val = JSON.parse(val);
                        } catch (e) {
                            return val;
                        }
                    }
                    return val;
                } else {
                    this.each(function(val, index, array) {
                        if (typeof name === o) {
                            for (prop in name)
                            val.setAttribute(prop, name[prop]);
                        } else {
                            val.setAttribute(name, renderArg(val, value, index, val.getAttribute(name)));
                        }
                    });
                    return this;
                }
            },
            
            removeAttr: function(name) {
                if (typeof name === "string") {
                    this.each(function(val){
                        val.removeAttribute(name);
                    });
                }
                return this;
            },
            
            prop: function(name, value) {
                if (this.length == 0) return undefined;

                if (arguments.length == 2) {
                    this.each.call(this, function(val, index, array) {
                        val[name] = value;
                    });
                } else return this[0][name];

                return this;
            },
            val: function() {
                if (this.length == 0) return undefined;
                return this[0].value;
            },
            
            html: function(html) {
                if (typeof html === u) {
                    return this[0].innerHTML;
                } else {
                    this.each.call(this, function(val, index, array) {
                        $(val).empty().append(renderArg(val, html, index));
                    });
                    return this;
                }
            },
            
            text: function(text) {
                if (typeof text === u) {
                    if (this.length == 0) return undefined;
                    else return this[0].textContent;
                } else if (typeof text === s) {
                    this.each.call(this, function(val, index, array) {
                        val.textContent = text;
                    });
                } else if (typeof text === f) {
                    this.each.call(this, function(val, index, array) {
                        val.textContent = renderArg(this, text, index, val.textContent);
                    });
                } else {
                    this.each.call(this, function(val, index, array) {
                        val.textContent = text.toString();
                    });

                }
                return this;
            },
            
            append: function(html) {
                var len = this.length;
                if (len > 0) {
                    if (typeof html === s) html = createFragment(html);
                    this.each.call(this, function(val, index, array) {
                        if (html instanceof Array) {
                            for (var i = 0; i < html.length; i++) {
                                val.appendChild(html[i]);
                            }
                        } else {
                            val.appendChild(html);
                        }

                    });
                }
                return this;
            },
            appendTo: function(target) {
				
                this.each.call(this, function(val, index, array) {
                    $(target).append(val);
                });
                return this;
            },
            
            prepend: function(html) {
                var len = this.length;
                if (len > 0) {
                    if (typeof html === s) html = createFragment(html);
                    this.each.call(this, function(val, index, array) {
                        if (html instanceof Array) {
                            var ref = $(val).children()[0];
                            for (var i = 0; i < html.length; i++) {
                                val.insertBefore(html[i], ref);
                            }
                        } else {
                            val.insertBefore(html, $(val).children()[0]);
                        }
                    });
                }
                return this;
            },
            prependTo: function(target) {
				
                this.each.call(this, function(val, index, array) {
                    $(target).prepend(val);
                });
                return this;
            },
            
            before: function(html) {
                var len = this.length;
                if (len > 0) {
                    if (typeof html === s) html = createFragment(html);
                    this.each.call(this, function(val, index, array) {
                        for (var i = 0; i < html.length; i++) {
                            val.parentNode.insertBefore(html[i], val);
                        }
                    });
                }
                return this;
            },
            
            after: function(html) {
                var len = this.length;
                if (len > 0) {
                    if (typeof html === s) html = createFragment(html);
                    this.each.call(this, function(val, index, array) {
                        for (var i = 0; i < html.length; i++) {
                            val.parentNode.insertBefore(html[i], val.nextSibling);
                        }
                    });
                }
                return this;
            },
            replaceWith: function(html) {
                this.each.call(this, function(val, index, array) {
                    $(val).before(html).remove();
                });
                return this;
            },
            
            empty: function() {
                this.each.call(this, function(val, index, array) {
					while(val.hasChildNodes())
                    	val.removeChild(val.childNodes[0]);
                });
                return this;
            },
            
            parent: function() {
                if (this.length == 0) return undefined;
                return $(this[0].parentNode);
            },
            
            children: function(elem) {
                if (this.length == 0) return undefined;
                return S(a.slice.call(
                    (typeof elem === u ?
                        toArray(this[0].children) :
                        toArray($(elem)[0].children))));
            },
            
            siblings: function(elem) {
                function filtered(e, a) {
                    return a.filter(function(element, index, array) {
                        return (e !== element);
                    });
                }

                return S(
                    a.slice.call(
                        (typeof elem === u ?
                            filtered(this[0], toArray(this[0].parentNode.children)) :
                            filtered($(elem)[0], toArray($(elem)[0].parentNode.children))
                        )
                    )
                );
            },
            find: function(selector) {
                var result = [];
                if (this.length == 0 || typeof selector === u) { return S(); }
                else {
                    this.each.call(this, function(val, index, array) {
                        result = result.concat(selectorEngine(val, selector));
                    });
                }
                return S(result);
            },
            closest: function(selector, context) {
                var el = this[0],
                    maybe = selectorEngine(context || d, selector);

                function tst(elem) {
                    if (maybe.indexOf(elem) > -1) {
                        el = $(elem);
                    } else {
                        if (elem !== context && elem !== d)
                            el = elem.parentNode;
                        tst(el);
                    }
                }

                if (maybe.length < 1) el = $();
                else tst(el);

                return el;
            },
            
            remove: function() {
                this.each.call(this, function(val, index, array) {
                    if (val.parentNode != null) {
                        val.parentNode.removeChild(val);
                    }
                });
                return this;
            },
            
            css: function(property, value) {
                function topx(s, v) {
                    return typeof v === n && !stylesUsingNumbers[s] ? v + "px" : v;
                }
                if (typeof property === s && typeof value === u) {
                    
                    if (this.length == 0) return undefined;
                    return w.getComputedStyle(this[0], null).getPropertyValue($.vendorStyle(property));
                } else {
                    var styleDef = "";
                    if (typeof property === s) {
                        var p = $.vendorStyle(property);
                        if(value === "") {
                            this.each.call(this, function(val) { val.style.removeProperty(p); });
                        } else {
                            styleDef = p + ":" + topx(property, value) + ";";
                        }
                    } else {
                        for (var prop in property) {
                            var p = $.vendorStyle(prop);
                            if (property[prop] === "") {
                                this.each.call(this, function(val, index, array) { val.style.removeProperty(p); });
                            } else {
                                styleDef += p + ":" + topx(prop, property[prop]) + ";";
                            }
                        }
                    }
                    this.each.call(this, function(val, index, array) {
                        val.style.cssText += styleDef;
                    });
                    return this;
                }
            },
            
            hasClass: function(className) {
                if ("classList" in d.documentElement) {
                    return this[0].classList.contains(className);
                } else {
                    var cl = this[0].className,
                        re = new RegExp(className);
                    return re.test(cl);
                }
            },
            
            addClass: function(className) {
                this.each.call(this, function(val, index, array) {
                    if ("classList" in d.documentElement) {
                        val.classList.add(className);
                    } else {
                        if (!$(val).hasClass(className)) {
                            var cl = val.className;
                            val.className = cl + " " + className;
                        }
                    }
                });
                return this;
            },
            
            removeClass: function(className) {
                this.each.call(this, function(val, index, array) {
                    if ("classList" in d.documentElement) {
                        val.classList.remove(className);
                    } else {
                        if ($(val).hasClass(className)) {
                            var cl = val.className.split(/\s+/),
                                index = cl.indexOf(className),
                                newVal;
                            cl.splice(index, 1);
                            newVal = cl.join(" ");
                            val.className = newVal;
                        }
                    }
                });
                return this;
            },
            
            toggleClass: function(className) {
                this.each.call(this, function(val, index, array) {
                    if ("classList" in d.documentElement) {
                        val.classList.toggle(className);
                    } else {
                        if ($(val).hasClass(className)) {
                            $(val).removeClass(className);
                        } else {
                            $(val).addClass(className);
                        }
                    }
                });
                return this;
            },
            copyStyle: function(el) {
                this.each.call(this, function(val, index, array) {
                    val.style.cssText = el.style.cssText;
                });
                return this;
            },
            
            height: function() {
                var box, height;
                if (this.length == 0) return undefined;

                return this[0].offsetHeight || this[0].height;
            },
            
            width: function() {
                var box, width;
                if (this.length == 0) return undefined;

                return this[0].offsetWidth || this[0].width;
           }
        }

        
        if (typeof Function.prototype.bind !== f) {
            Function.prototype.bind = function() {
                var f = this, args = Array.prototype.slice.call(arguments), o = args.shift();
                return function() {
                    return f.apply(o, args.concat(Array.prototype.slice.call(arguments)));
                };
            };
        }

        $.register($.fn);
        return $;
    };

    var s = scout();
    exports.S = exports.Scout = s;
    "$" in exports || (exports.$ = s);

})(window);





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

            
            if (options.url.indexOf(window.location.hostname) > -1) isCORS = true;

            var deferred = new $.Deferred();

            
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
            
            xhr.send(options.method == "POST" ? options.data : null);

            if (options.timeout > 0) {
                xhrTimeout = setTimeout(timeoutHandler, options.timeout);
            }

            return deferred.promise(xhr);
        }
    }

    extend(exports.Scout);
})(window);





(function($) {
    $.trigger = function(el, type, args, opts) {
        args = args || {};
        opts = opts || {bubbles: true, cancelable: true};
        var e;

        if(document.createEvent) {
            e = document.createEvent("Event");
            e.initEvent(type, opts.bubbles, opts.cancelable);
            $.extend(e, args);
            el.dispatchEvent(e);
        }
    };

    
    $.fn.trigger = function(type, args, opts) {
        this.each(function(el) {
            $.trigger(el, type, args, opts);
        });
        return this;
    };
    
    $.fn.bind = function(type, callback) {
        this.each(function(el) {
            el.addEventListener(type, callback);
        });
        return this;
    }
    
    $.fn.unbind = function(type, callback) {
        this.each(function(el) {
            el.removeEventListener(type, callback);
        });
        return this;
    }
    
    $.fn.on = function(type, selector, callback) {
        if(typeof selector === "string") {
            this.delegate(selector, type, callback);
        } else {
            this.bind(type, selector);
        }
		return this;
    };
    
    $.fn.one = function(type, selector, callback) {
        var c = this;
        var wrapper = function(e) {
            callback(e);
            c.off(type, selector, wrapper);
        }
        if(typeof selector === "string") {
            return c.on(type, selector, wrapper);
        } else {
            callback = selector;
            selector = wrapper;
            return c.on(type, wrapper);
        }
    }
    
    $.fn.off = function(type, selector, callback) {
        if(typeof selector === "string") {
            this.undelegate(selector, type, callback);
        } else {
            callback = selector;
            this.unbind(type, callback);
        }
		return this;
    };
    var _d = "_delegate";
    
    $.fn.delegate = function(selector, type, callback) {
        var $c = this;
        this.each(function(el) {
            var dd = $.data(el, _d) || $.data(el, _d, []);
            var delegate = function(e) {
                var $el = $c.find(selector);
                if($el.indexOf(e.target) >= 0) {
                    callback.call(e.target, e);
                }
            };
            dd.push({sel:selector, cb:callback, d: delegate});
            el.addEventListener(type, delegate);
        });
        return this;
    };
    
    $.fn.undelegate = function(selector, type, callback) {
        this.each(function(el) {
            var dd = $.data(el, _d);
            if(dd) {
                for(var i = 0; i < dd.length; i++) {
                    if(dd[i].sel === selector && dd[i].cb === callback) {
                        el.removeEventListener(type, dd[i].d);
                        dd.splice(i, 1);
                        return;
                    }
                }
            }
        });
        return this;
    };

    $.register();
})(Scout);
