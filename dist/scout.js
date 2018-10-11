//     scout.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

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

        /**
         * Core Scout object. Attempts to subclass Array.
         * Derived from: http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
         *
         * @class Scout
         * @constructor
         */
        function Scout() {};
        Scout.prototype = new Array;

        function S(elements) {
            elements = elements || [];

            var s = new Scout();
            s.concat(elements);

            return s;
        }

        /**
         * Primary selector interface.
         *
         * @method $
         * @param {String, Function, Array} selector
         *      String: Specifies the DOM selector to execute.
         *      Function: Specifies a callback to be executed on DOM ready.
         *      Array: Specifies an array of string selectors to execute.
         *      Array: When an array with two numbers is provided, specifies a DOM selector using viewport coordinates.
         * @param {Object} [context] context The context in which the selector should be applied. document by default.
         */
        function $(selector, context) {
            var elements = [];
            context = context || document;

            if (typeof selector === u) {
                return S(elements);
            } else if (typeof selector === s) { //selector is a string
                //if a string of valid html is passed in
                if (/^\s*<(\w+)[^>]*>/.test(selector))
                    elements = createFragment(selector);
                else
                    elements = selectorEngine(context, selector);
            } else if (typeof selector === f) {
                $.fn.ready(selector);
            } else if (selector instanceof Array) {
                //if a Scout object is passed in
                if (selector.ready) return selector;

                //array of selectors or elements or coordinates
                if (selector.every(function(el) { return typeof el === s })) {
                    //bunch-o-string selectors
                    for (i = 0; i < selector.length; i++)
                        elements = elements.concat(
                            selectorEngine(context, selector[i])
                            );
                } else if (selector.every(function(el) { return typeof el === o })) {
                    return S(selector);
                } else if (selector.length == 2 &&
                    selector.every(function(p) { return typeof p === n })) {
                    //selects element by viewport coordinates
                    elements = d.elementFromPoint(selector[0], selector[1]);
                }
            } else if (selector.nodeType == 1 ||
                selector.nodeType == 3 ||
                selector.nodeType == 9 ||
                selector === w) {
                //selector is the document node, a text node or an element node
                elements = [selector];
            }

            return S(elements);
        }

        $.VERSION = "1.0.0";

        function selectorEngine(element, selector) {
            var result;
            //engine is optimized by highest performing queries first
            //represents the perferred priority of section types
            if (/^\.([\w\-]+)$/.test(selector)) { //select by single class identifier
                result = element.getElementsByClassName(RegExp.$1);
            } else if (/^#([\w\-]+)$/.test(selector)) { //select by ID
                result = d.getElementById(RegExp.$1);
                return result ? [result] : [];
            } else if (/^[\w]+$/.test(selector)) { //select by tag name
                result = element.getElementsByTagName(selector);
            } else { //just try to find somehting, usually a nested query.
                result = element.querySelectorAll(selector);
            }

            return toArray(result);
        }

        //used to convert a NodeList or arguments into an Array
        function toArray(nl) {
            var arr = [];
            for (var i = nl.length; i--; arr.unshift(nl[i])) {}
            return arr;
        }

        //turn strings into html
        function createFragment(html) {
            var fragment = d.createElement("div");
            fragment.insertAdjacentHTML("beforeend", html);
            return a.slice.call(toArray(fragment.childNodes), 0);
        }

        //dynamically determine an arguments value when a function
        function renderArg(thisobj, arg, index, currVal) {
            return (typeof arg === f) ? arg.call(thisobj, index, currVal) : arg;
        }

        /**
         * Extends an object with additional functionality.
         *
         * @method $.extend
         * @param {Object} [deep] if true, do a deep copy (do not pass false, omit it instead)
         * @param {Object} dest The object to be extended.
         * @param {Object} src The object to extend into dest.
         * @param {Array} [rm] An array of property names that should be excluded from src when extending dest.
         */
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
                    //TODO - test to make sure calling the named function works as exppected
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

        /**
         * Extends the Scout object with additional functionality.
         *
         * @param {Object} module The module to extend Scout with.
         */
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

        /**
         * This is a low-level function that gets or sets custom data attached
         * to an element.
         *
         * Please see the .data() function for general use.
         *
         * @param {Object} el a DOM element
         * @param {String} [key] the data key
         * @param {Object} [value] the value or reference to be stored
         * @return {Object} the stored value or undefined if no such key exists
         * @method $.data
         */
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

        /**
         * This is a low-level method that removes a data value from an element.
         *
         * Please see the .removeData() function for general use.
         *
         * @param {Object} [el] the element
         * @param {String} [key*] the data key
         * @method $.removeData
         */
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

        /**
         * Returns a value indicating whether or not a value is contained within
         * an array. If present, returns the item's index. Otherwise, returns -1.
         *
         * @param {Object} val the value to search for
         * @param {Array} arr the array to search
         * @method $.inArray
         */
        $.inArray = function(val, arr) {
            return arr.indexOf(val);
        }

        //all of the properties on the destination object are matched up with something on the source object
        $.automap = function(map, src) {
            if (arguments.length !== 2) return;
            var result = {};
            //had to do it this way becuase i coldn't figure out how to clone a function.
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

        //safe logging
        $.log = function(msg, force) {
            force = force || false;
            if (typeof console === "undefined" || force) { //for IE when debugger is closed
                $("p.log-output").append(msg + "<br/>");
            } else if (typeof console.log === "function") {
                console.log.call(console, msg);
            } else { //for IE when debugger is open
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
            /**
             * Executes a callback on document ready.
             *
             * @method $.ready
             * @param {Function} callback The callback to be executed.
             */
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
            /**
             * Enumerates through a collection and executes the specified function.
             *
             * @method $.each
             * @param {Function} func The function to be executed for each element.
             */
            each: function(func) {
                //for each element in scout object, call the passed in function
                //in the context of the current element to preserve the foreach
                //signature for this method.
                this.forEach(function(val, index, array) {
                    func.call(val, val, index, array);
                });
                return this;
            },
            /**
             * Concatenates the provided arguments.
             *
             * @method $.concat
             */
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
            /**
             * Gets or sets custom data attached to one or more elements. If no
             * value is provided, the existing value for the specified key is
             * returned, or the value of the data-[key] attribute if no such key
             * exists. Otherwise, the value is attached to the element(s).
             *
             * If no key is provided, the entire data set is returned as an object.
             *
             * This method preserves references.
             *
             * @param {String} [key] the data key
             * @param {Object} [value] the value or reference to be stored
             * @return {Object} the stored data value or undefined if there is no such key
             * @method .data
             */
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
            /**
             * Removes an existing data value from the element(s). If no keys are
             * provided, all data values are removed.
             *
             * @param {String} [key*] the data key
             * @return {Object} returns this
             * @method .removeData
             */
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
            /**
             * Filters an array based on the specified function.
             *
             * @method $.filter
             * @param {Function} func A function used to determine whether or not an element should be filtered.
             */
            filter: function(func) {
                return $(filtered = a.filter.call(this, func));
            },
            /**
             * Joins an array of strings by the specified separator.
             *
             * @method $.join
             * @param {String} separator The string to join each element with.
             * @param {Array] attr The elements to join.
             */
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
            /**
             * Returns the index of the last occurrence of the
             * specified selector.
             *
             * @method $.lastIndexOf
             * @param {String} searchElement The selector to find the last occurrence of.
             */
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
            /**
             * Gets or sets a DOM element's attribute. Will attempt to return
             * the attribute as JSON if the attribute's value can be parsed.
             *
             * @method $.attr
             * @param {String} name The name of the attribute to get or set.
             * @param {String} [value] If specified, the value to assign to the specified attribute.
             */
            attr: function(name, value) {
                if (this.length == 0) return undefined;

                if (typeof name === s && typeof value === u) {
                    //no value passed, so just get current value
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
                        } else {//there is a value, so let's try and set it
                            val.setAttribute(name, renderArg(val, value, index, val.getAttribute(name)));
                        }
                    });
                    return this;
                }
            },
            /**
             * Removes a DOM element's attribute.
             *
             * @method $.removeAttr
             * @param {String} name The name of the attribute to remove.
             */
            removeAttr: function(name) {
                if (typeof name === "string") {
                    this.each(function(val){
                        val.removeAttribute(name);
                    });
                }
                return this;
            },
            /**
             * Gets or sets a DOM element's property.
             *
             * @method $.prop
             * @param {String} name The name of the property to get or set.
             * @param {String} [value] If specified, the value to assign to the specified property.
             */
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
            /**
             * Gets or sets the HTML associated with a DOM element.
             *
             * @method $.html
             * @param {String} [html] If specified, sets the innerHTML of the DOM element.
             */
            html: function(html) {
                if (typeof html === u) {//nothing was passed in, so retrieve it
                    return this[0].innerHTML;
                } else {
                    this.each.call(this, function(val, index, array) {
                        $(val).empty().append(renderArg(val, html, index));
                    });
                    return this;
                }
            },
            /**
             * Gets or sets the text associated with a DOM element.
             *
             * @method $.text
             * @param {String, Function} [text] If specified, sets the text of the DOM element.
             */
            text: function(text) {
                if (typeof text === u) {//nothing was passed in, so retrieve it
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
            /**
             * Appends the provided HTML to a DOM element.
             *
             * @method $.append
             * @param {String} html The HTML to append to the DOM element.
             */
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
            appendTo: function(target) { //TODO: - should support any argument type that the $() accepts
                this.each.call(this, function(val, index, array) {
                    $(target).append(val);
                });
                return this;
            },
            /**
             * Prepends the provided HTML to a DOM element.
             *
             * @method $.prepend
             * @param {String} html The HTML to prepend to the DOM element.
             */
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
            prependTo: function(target) { //TODO: - should support any argument type that the $() accepts
                this.each.call(this, function(val, index, array) {
                    $(target).prepend(val);
                });
                return this;
            },
            /**
             * Creates a DOM element containing the provided HTML before
             * another DOM element.
             *
             * @method $.before
             * @param {String} html The HTML to emit before the DOM element.
             */
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
            /**
             * Creates a DOM element containing the provided HTML after
             * another DOM element.
             *
             * @method $.after
             * @param {String} html The HTML to emit after the DOM element.
             */
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
            /**
             * Removes the inner HTML associated with a DOM element.
             *
             * @method $.empty
             */
            empty: function() {
                this.each.call(this, function(val, index, array) {
                  while(val.hasChildNodes())
                    val.removeChild(val.childNodes[0]);
                });
                return this;
            },
            /**
             * Gets the index of a child element with the specified selector.
             *
             * @method $.index
             * @param {String} elem The selector of an element to get the index of.
             */
            index: function(elem) {
                return (typeof elem === u) ?
                    this.parent().children().indexOf(this[0]) :
                    this.indexOf($(elem)[0]);
            },
            /**
             * Gets the parent of a DOM element.
             *
             * @method $.parent
             */
            parent: function() {
                if (this.length == 0) return undefined;
                return $(this[0].parentNode);
            },
            /**
             * Gets the child elements of a DOM element.
             *
             * @method $.children
             * @param {String} elem The selector of an element to get the children of.
             */
            children: function(elem) {
                if (this.length == 0) return undefined;
                return S(a.slice.call(
                    (typeof elem === u ?
                        toArray(this[0].children) :
                        toArray($(elem)[0].children))));
            },
            /**
             * Gets the sibling elements of a DOM element.
             *
             * @method $.siblings
             * @param {String} elem The selector of an element to get the siblings of.
             */
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
            /**
             * Removes a DOM element.
             *
             * @method $.remove
             */
            remove: function() {
                this.each.call(this, function(val, index, array) {
                    if (val.parentNode != null) {
                        val.parentNode.removeChild(val);
                    }
                });
                return this;
            },
            /**
             * Gets or sets the specified CSS attribute, adding vendor-specific prefixes
             * if necessary.
             *
             * @method $.css
             * @param {String} property The name of the CSS attribute to get or set.
             * @param {String} [value] If specified, the value of the CSS attribute to set.
             */
            css: function(property, value) {
                function topx(s, v) {
                    return typeof v === n && !stylesUsingNumbers[s] ? v + "px" : v;
                }
                if (typeof property === s && typeof value === u) {
                    //no value was passed in, so retrieve single property
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
            /**
             * Returns a value indicating whether or not a DOM element
             * has a specific CSS class.
             *
             * @method $.hasClass
             * @param {String} className The name of the CSS class to check for.
             */
            hasClass: function(className) {
                if ("classList" in d.documentElement) {
                    return this[0].classList.contains(className);
                } else {
                    var cl = this[0].className,
                        re = new RegExp(className);
                    return re.test(cl);
                }
            },
            /**
             * Adds a CSS class to a DOM element.
             *
             * @method $.addClass
             * @param {String} className The name of the CSS class to add.
             */
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
            /** Removes a CSS class from a DOM element.
             *
             * @method $.removeClass
             * @param {String} className The name of the CSS class to remove.
             */
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
            /**
             * Toggles the presence of a CSS class for a DOM element.
             *
             * @method $.toggleClass
             * @param {String} className The name of the CSS class to toggle.
             */
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
            /**
             * Gets the height of a DOM element.
             *
             * @method $.height
             */
            height: function() {
                var box, height;
                if (this.length == 0) return undefined;

                return this[0].offsetHeight || this[0].height;
            },
            /**
             * Gets the width of a DOM element.
             *
             * @method $.width
             */
            width: function() {
                var box, width;
                if (this.length == 0) return undefined;

                return this[0].offsetWidth || this[0].width;
           }
        }

        // some scout modules rely on function binding, but it is a recent ECMAScript addition
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

//     event.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

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

    /**
     * Trigger a named event with optional arguments. By default, the
     * event will bubble up and is cancelable.
     *
     * @param {String} type the event type name (e.g., "click")
     * @param {String} [args] an args object to be merged with the event arguments
     * @param {Object} [opts] the value or reference to be stored
     * @return {Object} returns this
     * @method .trigger
     */
    $.fn.trigger = function(type, args, opts) {
        this.each(function(el) {
            $.trigger(el, type, args, opts);
        });
        return this;
    };
    /**
     * Add an event handler for a named event type.
     *
     * @param {String} type the event type name (e.g., "click")
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .bind
     */
    $.fn.bind = function(type, callback) {
        this.each(function(el) {
            el.addEventListener(type, callback);
        });
        return this;
    }
    /**
     * Remove an existing event handler.
     *
     * @param {String} type the event type name
     * @param {Function} [callback] the previously-added event handler
     * @return {Object} returns this
     * @method .unbind
     */
    $.fn.unbind = function(type, callback) {
        this.each(function(el) {
            el.removeEventListener(type, callback);
        });
        return this;
    }
    /**
     * Add an event handler.
     *
     * @param {String} type the event type name
     * @param {String} [selector] a selector, specifying other elements to delegate the event to
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .on
     */
    $.fn.on = function(type, selector, callback) {
        if(typeof selector === "string") {
            this.delegate(selector, type, callback);
        } else {
            this.bind(type, selector);
        }
		return this;
    };
    /**
     * Add an event handler to be executed once. Works exactly like .on() except the handler
     * is removed immediately after its first invocation.
     *
     * @param {String} type the event type name
     * @param {String} [selector] a selector, specifying other elements to delegate the event to
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .on
     */
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
    /**
     * Remove an existing event handler.
     *
     * @param {String} type the event type name
     * @param {String} [selector] the delegate selector, if preivously provided
     * @param {Function} [callback] the previously-added event handler
     * @return {Object} returns this
     * @method .off
     */
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
    /**
     * Add an event handler that fires when another element, specified by the selector,
     * triggers that event. The callback is called in the context of the element
     * matching the selector.
     *
     * @param {String} [selector] the delegate selector
     * @param {String} type the event type name
     * @param {Function} [callback] the event handler
     * @return {Object} returns this
     * @method .delegate
     */
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
    /**
     * Remove a previously-subscribed delegate event handler.
     *
     * @param {String} [selector] the delegate selector
     * @param {String} type the event type name
     * @param {Function} [callback] the previously-added event handler
     * @return {Object} returns this
     * @method .delegate
     */
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
