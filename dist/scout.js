//     scout.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function(exports) {
    var scout = function() {
        var a = [],
            b = 'boolean',
            d = document,
            f = 'function',
            n = 'number',
            o = 'object',
            s = 'string',
            u = 'undefined',
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

        $.VERSION = '0.9.0';

        function selectorEngine(element, selector) {
            var result;
            //engine is optimized by highest performing queries first
            //represents the perferred priority of section types
            if (/^\.([\w-]+)$/.test(selector)) {
                //select by single class identifier
                result = element.getElementsByClassName(RegExp.$1);
            } else if (/^#([\w-]+)$/.test(selector)) {//select by ID
                result = d.getElementById(RegExp.$1);
                return result ? [result] : [];
            } else if (/^[\w]+$/.test(selector)) {//select by tag name
                result = element.getElementsByTagName(selector);
            } else {//just try to find somehting, usually a nested query.
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
            var fragment = d.createElement('div');
            fragment.insertAdjacentHTML('beforeend', html);
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
        $.extend = function(deep, dest, src, rm) {
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
                    arguments.callee(dest[prop], src[prop]);
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
         * @for Scout
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
         * @for Scout
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
         * @for Scout
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
            if (typeof console === 'undefined' || force) { //for IE when debugger is closed
                $('p.log-output').append(msg + '<br/>');
            } else if (typeof console.log === 'function') {
                console.log.call(console, msg);
            } else { //for IE when debugger is open
                Function.prototype.bind.call(console.log, console).call(console, msg);
            }
        };

        $.defer = (function() {
            var deferred = [],
                msgId = 'defer-msg';

            function defer(context, fn, args) {
                deferred.push({ctx: context, f: fn, a: args});
                window.postMessage(msgId, '*');
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

            window.addEventListener('message', deferHandler, true);
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
                var rs = 'readyState',
                    rsc = 'readystatechange',
                    dcl = 'DOMContentLoaded';

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
             * @for Scout
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
             * @for Scout
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
                    return a.join.call(this, separator || ',');
                } else {
                    var str = '';
                    this.forEach(function(val, index, array) {
                        str += $(val).attr(attr) + (separator || ',');
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

                    if (val.charAt(0) == '{' || val.charAt(0) == '[') {
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
                if (typeof name === 'string') {
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
            appendTo: function(target) {
				//TODO: - should support any argument type that the $() accepts
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
            prependTo: function(target) {
				//TODO: - should support any argument type that the $() accepts
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
                    var styleDef = '';
                    if (typeof property === s) {
                        var p = $.vendorStyle(property);
                        if(value === '') {
                            this.each.call(this, function(val) { val.style.removeProperty(p); });
                        } else {
                            styleDef = p + ':' + topx(property, value) + ';';
                        }
                    } else {
                        for (var prop in property) {
                            var p = $.vendorStyle(prop);
                            if (property[prop] === '') {
                                this.each.call(this, function(val, index, array) { val.style.removeProperty(p); });
                            } else {
                                styleDef += p + ':' + topx(prop, property[prop]) + ';';
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
                if ('classList' in d.documentElement) {
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
                    if ('classList' in d.documentElement) {
                        val.classList.add(className);
                    } else {
                        if (!$(val).hasClass(className)) {
                            var cl = val.className;
                            val.className = cl + ' ' + className;
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
                    if ('classList' in d.documentElement) {
                        val.classList.remove(className);
                    } else {
                        if ($(val).hasClass(className)) {
                            var cl = val.className.split(/\s+/),
                                index = cl.indexOf(className),
                                newVal;
                            cl.splice(index, 1);
                            newVal = cl.join(' ');
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
                    if ('classList' in d.documentElement) {
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
    '$' in exports || (exports.$ = s);

})(window);
//     ajax.js
//     (c) 2013 Chris Colinsky https://github.com/dev-scouts-of-america/scout.js
//     Licensed under the terms of the MIT license.

(function(exports) {
    var extend = function($) {
        $.ajax = function(url, options) {
            var xhr = new XMLHttpRequest(),
                defaultOptions = {
                    url: null,
                    context: xhr,
                    method: 'GET',
                    headers: {},
                    responseType: 'json',
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

            if (typeof url === 'string') {
                defaultOptions.url = url;
            } else if (typeof url === 'object') {
                options = url;
            }

            defaultOptions.headers['Accept'] = '*/*';
            defaultOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            defaultOptions.headers['X-Requested-With'] = 'XMLHttpRequest';

            options = options || defaultOptions;
            options = $.automap(defaultOptions, options);

            if (options.url === null) throw new Error('no url was provided for ajax call');

            //check for CORS request
            if (options.url.indexOf(window.location.hostname) > -1) isCORS = true;

            var deferred = new $.Deferred();

            //https://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
            if (!('withCredentials' in xhr) && window.XDomainRequest && isCORS) {
                xhr = new XDomainRequest();
                if (xhr) {
                    xhr.onload = function() {
                        deferred.resolve(xhr.responseText, xhr.statusText, xhr);
                        options.complete.call(options.context, xhr.responseText);
                    };
                    xhr.onerror = function() {
                        deferred.reject(xhr, xhr.statusText);
                        options.error.call(options.context, '', new Error('unable to make xhr request.'));
                    };
                    xhr.onprogress = options.progress;
                    xhr.timeout = options.timeout;
                    xhr.open(options.method, url);
                } else {
                    options.error.call(options.context, '', new Error('unable to make xhr request.'));
                }
            } else {
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) return;

                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                        deferred.resolve(xhr.responseText, xhr.statusText, xhr);
                        options.complete.call(options.context, xhr.responseText, xhr.getResponseHeader('Content-Type'));
                    } else if (xhr.status == 404 || xhr.status == 500) {
                        deferred.reject(xhr, xhr.statusText);
                        options.complete.call(options.context, xhr.responseText, new Error(xhr.status));
                    }
                }

                xhr.onprogress = options.progress;

                xhr.open(options.method, options.url, true);
                xhr.timeout = options.timeout;

                if (options.method == 'POST') {
                    var headers = options.headers;
                    for (p in headers) {
                        xhr.setRequestHeader(p, headers[p]);
                    }
                }
            }
            //TODO - automatically handle data when request is a GET
            xhr.send(options.method == 'POST' ? options.data : null);

            if (options.timeout > 0) {
                xhrTimeout = setTimeout(timeoutHandler, options.timeout);
            }

            return deferred.promise(xhr);
        }
    }
	
    extend(exports.Scout);
})(window);
(function($){
    // helper: invoke a series of callbacks with a scope and args, and clear
    // the queue.
    function invoke(scope, args, arr) {
        if(arr instanceof Array) {
            arr.forEach(function(c) { c.apply(scope, args); });
            arr.length = 0;
        }
    }

    /**
     * Tracks an asynchronous operation and provides notification for success,
     * failure, and progress updates. Deferred objects may be chained together
     * and multiple simultaneous operations may be tracked using $.when().
     *
     * @class $.Deferred
     * @constructor
     * @param {Function} [beforeStart] a callback invoked before the constructor completes
     * @for Scout
     */
    $.Deferred = function(beforeStart) {
        // new operator optional
        if(!(this instanceof $.Deferred)) {
            return new $.Deferred();
        }
        
        // 0 = pending
        // 1 = resolved
        // 2 = rejected
        this._state = 0;
        var d = this;

        /**
         * An immutable interface for the deferred class, typically returned by
         * functions that start async operations.
         *
         * @class Promise
         * @for $.Deferred
         */
        d._promise = {
            _promise: true,

            /**
             * Add one or more callback functions to be invoked when the operation
             * either succeeds or fails. Zero or more arguments may be provided
             * depending on the operation.
             *
             * @method always
             * @param {Function} args* one or more callbacks
             * @return {Object} [args] returns this
             * @for Promise
             */
            always: function() {
                this.done(arguments);
                this.fail(arguments);
                return this;
            },
            /**
             * Add one or more callback functions to be invoked when the operation
             * succeeds. Zero or more arguments may be provided depending on the
             * operation.
             *
             * @method done
             * @param {Function} args* one or more callbacks
             * @return {Object} returns this
             * @for Promise
             */
            done: function() {
                d._done = flatten(d._done, arguments);
                if(d._state === 1) {
                    invoke(d._scope || d, d._args, d._done);
                }
                return this;
            },
            /**
             * Add one or more callback functions to be invoked when the operation
             * fails. Zero or more arguments may be provided depending on the
             * operation.
             *
             * @method fail
             * @param {Function} args* one or more callbacks
             * @return {Object} returns this
             * @for Promise
             */
            fail: function() {
                d._fail = flatten(d._fail, arguments);
                if(d._state === 2) {
                    invoke(d._scope || d, d._args, d._fail);
                }
                return this;
            },
            /**
             * Add one or more callback functions to be invoked when the operation
             * makes progress. Zero or more arguments may be provided depending on the
             * operation.
             *
             * @method progress
             * @param {Function} args* one or more callbacks
             * @return {Object} returns this
             * @for Promise
             */
            progress: function() {
                d._progress = flatten(d._progress, arguments);
                return this;
            },
            /**
             * Indicates whether the operation has failed.
             * 
             * @method isRejected
             * @return {Boolean} returns true if the operation failed
             * @for Promise
             */
            isRejected: function() { return d._state === 2; },
            /**
             * Indicates whether the oepration has succeeded.
             *
             * @method isResolved
             * @return {Boolean} returns true if the operation succeeded
             * @for Promise
             */
            isResolved: function() { return d._state === 1; },
            /**
             * Gets the current state of the operation. Possible values are
             * "pending", "resolved", or "rejected".
             *
             * @method state
             * @return {String} returns the current state of the operation
             * @for Promise
             */
            state: function() {
                switch(d._state) {
                    case 0: return "pending";
                    case 1: return "resolved";
                    case 2: return "rejected";
                }
            },
            /**
             * Returns a new promise that applies the provided filter functions
             * to the output arguments supplied by this promise.
             *
             * @method then
             * @param {Function} doneFilter the done filter callback
             * @param {Function} [failFilter] the fail filter callback
             * @param {Function} [progressFilter] the progress filter callback
             * @returns {Object} a new promise that will complete when this one does
             * @for Promise
             */
            then: function(doneFilter, failFilter, progressFilter) {
                var next = new $.Deferred();
                this.done(bindFilter(next.resolve.bind(next), doneFilter, d));
                this.fail(bindFilter(next.reject.bind(next), failFilter, d));
                this.progress(bindFilter(next.notify.bind(next), progressFilter, d));
                return next.promise();
            },
            promise: function() { return this; }
        };
        this._promise.prototype = {
            constructor: $.Deferred
        };

        if(typeof beforeStart === "function") {
            beforeStart.call(this, this);
        }

        // helper: callbacks could be passed in as functions or arrays of functions,
        // so flatten them out
        function flatten(arr, args) {
            arr = arr || [];
            // may not be an array
            for(var i = 0; i < args.length; i++) {
                var c = args[i];
                if(typeof c === "function")
                    arr.push(c);
                else if (c instanceof Array || typeof c === "object" && typeof c.length === "number") { 
                    flatten(arr, c);
                }
            }
            return arr;
        }

        // helper: apply an optional filter function when chaining two deferred objects.
        function bindFilter(next, filter, scope) {
            if(typeof filter === "function") {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    var newArg = filter.apply(scope, arguments);
                    args = newArg !== null && typeof newArg !== "undefined" ? [newArg] : args;
                    next.apply(null, args);
                }
            } else {
                return next;
            }
        }
    }

    $.Deferred.prototype = {
        /**
         * To be called when the asynchronous operation has succeeded. The done
         * callbacks will be executed with the supplied arguments.
         *
         * @param {Object} [args]* callback arguments
         * @method resolve
         * @for $.Deferred
         */
        resolve: function() {
            if(this._state > 0) return;
            this._state = 1;
            this._args = Array.prototype.slice.call(arguments);
            this._args.push(this._promise);
            invoke(this._scope || this._promise, this._args, this._done);
        },
        /**
         * To be called when the asynchronous operation succeeds, providing a
         * scope. The 'this' value of the callbacks will be set to the first
         * argument, and all additional parameters will be passed.
         *
         * @param {Object} scope callback scope
         * @param {Object} [args]* callback arguments
         * @method resolveWith
         * @for $.Deferred
         */
        resolveWith: function(scope) {
            if(this._state > 0) return;
            this._scope = scope;
            this.resolve.apply(this, Array.prototype.slice.call(arguments, 1));
        },
        /**
         * To be called when the asynchronous operation has failed. The fail
         * callbacks will be executed with the supplied arguments.
         *
         * @param {Object} [args]* callback arguments
         * @method reject
         * @for $.Deferred
         */
        reject: function() {
            if(this._state > 0) return;
            this._state = 2;
            this._args = Array.prototype.slice.call(arguments);
            this._args.push(this._promise);
            invoke(this._scope || this._promise, this._args, this._fail);
        },
        /**
         * To be called when the asynchronous operation fails, providing a
         * scope. The 'this' value of the callbacks will be set to the first
         * argument, and all additional parameters will be passed.
         *
         * @param {Object} scope callback scope
         * @param {Object} [args]* callback arguments
         * @method rejectWith
         * @for $.Deferred
         */
        rejectWith: function(scope) {
            if(this._state > 0) return;
            this._scope = scope;
            this.reject.apply(this, Array.prototype.slice.call(arguments, 1));
        },
        /**
         * To be called when the asynchronous operation has made progress. The progress
         * callbacks will be executed with the supplied arguments.
         *
         * @param {Object} [args]* callback arguments
         * @method notify
         * @for $.Deferred
         */
        notify: function() {
            var args = Array.prototype.slice.call(arguments);
            args.push(this._promise);
            invoke(this._promise, args, this._progress);
        },
        /**
         * To be called when the asynchronous operation makes progress, providing a
         * scope. The 'this' value of the callbacks will be set to the first
         * argument, and all additional parameters will be passed.
         *
         * @param {Object} scope callback scope
         * @param {Object} [args]* callback arguments
         * @method notifyWith
         * @for $.Deferred
         */
        notifyWith: function(scope) {
            var args = Array.prototype.slice.call(arguments, 1);
            args.push(this._promise);
            invoke(scope, args, this._progress);
        },
        /**
         * Returns a promise, which is an immutable version of the deferred object.
         * This is normally called by API implementors when beginning an async
         * operation so that the consumer can attach callbacks and check progress.
         *
         * @method promise
         * @returns {Object} a promise, or immutable version of the deferred object.
         * @for $.Deferred
         */
        promise: function(obj) {
            if(typeof obj === "object") {
                return this._promise = $.extend(obj, this._promise);
            }
            return this._promise;
        }
    };

    /**
     * Combines one or more deferred objects or promises into a single promise which
     * will call its done callbacks when all operatinos have succeeded or its fail
     * callbacks when any operation fails.
     *
     * When supplying multiple promises, the arguments for each operation will be
     * supplied as arrays to the callbacks in the same order that the operations were
     * provided to this function.
     *
     * @method $.when
     * @param {Object} args* one or more promise or deferred objects
     * @returns {Object} a new aggregate promise
     * @for Scout
     */
    $.when = function() {
        if(arguments.length < 2) {
            // a single deferred/promise merely returns the same promise
            var arg = arguments[0];
            if(typeof arg.promise === "function") {
                return arg.promise();
            }
            else {
                // any other kind of object (or nothing) returns a resolved 
                // deferred with the original argument.
                var result = new $.Deferred();
                result.resolve(arg);
                return result.promise();
            }
        }

        // multiple deferreds - track them all
        var master = new $.Deferred(),
            count = 0,
            args = [[]];
        var fail = master.reject.bind(master);
        for(var i = 0; i < arguments.length; i++) {
            var d = arguments[i];
            if(typeof d.promise === "function") {
                d = d.promise();
                args[0][i] = d;
                count++;
                (function(idx) {
                    d.done(function() {
                        // collect all done arguments
                        args[idx + 1] = Array.prototype.slice.apply(arguments);
                        if(!--count) {
                            master.resolveWith.apply(master, args);
                        }
                    });
                })(i);
                // a single failure stops the whole show
                d.fail(fail);
            }
        }
        return master.promise();
    };

    /**
     * Returns a promise that completes when all promises attached to the elements
     * in the collection are complete. An optional category name can be used to
     * filter promises. For example, passing "fx" will filter for animation promises.
     *
     * @method .promise
     * @param {Object} [category] an optional category name to filter
     * @returns {Object} a new aggregate promise
     * @for Scout
     */
    $.fn.promise = function(category) {
        var defers = [],
            useCategory = typeof category === "string",
            count = 0,
            master = new $.Deferred(),
            $c = this;
        this.each(function(e) {
            var dd = $.data(e, "_defer");
            if(!dd) return;
            for(var i in dd) {
                if(useCategory && category !== i) continue;
                for(var j in dd[i]) {
                    var defer = dd[i][j];
                    if(defers.indexOf(defer) < 0) {
                        count++;
                        defers.push(defer);
                        defer.promise().done(function() {
                            if(!--count) master.resolveWith($c, $c);
                        });
                    }
                }
            }
        });
        return master.promise();
    }
    $.register();
})(Scout);
//     events.js
//     (c) 2013 Chris Colinsky https://github.com/dev-scouts-of-america/scout.js
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
     * @for Scout
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
     * @for Scout
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
     * @for Scout
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
     * @for Scout
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
     * @for Scout
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
     * @for Scout
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
     * @for Scout
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
     * @for Scout
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
//     animation.js
//     (c) 2013 Chris Colinsky https://github.com/dev-scouts-of-america/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    var transitionEnd = "transitionend",
        style = $.vendorStyle("transition");

    switch(style) {
        case "-webkit-transition":
            transitionEnd = "webkitTransitionEnd";
            break;
        case "-ms-transition":
            transitionEnd = "MSTransitionEnd";
            break;
    }

    $.fn.animate = function(properties, duration, options) {
        var defaultOptions = {
            ease: 'ease-out',
            delay: 0,
            complete: function() {}
        },
        clear = {};

        clear['transition-property'] = '';
        clear['transition-duration'] = '';
        clear['transition-timing-function'] = '';
        clear['transition-delay'] = '';
        clear['animation-name'] = '';
        clear['animation-duration'] = '';

        duration = duration || 0.3;
        options = options || defaultOptions;
        options = $.automap(defaultOptions, options);

        var _d = "_defer";
        var defer = new $.Deferred();
        this.each(function(val) {
            var dd = $.data(val, _d) || $.data(val, _d, {});
            dd = (dd["fx"] = dd["fx"] || []);
            dd.push(defer);
        });

        $.defer(this, exec);
        function exec() {
            var count = this.length;
            var c = this;
            this.each(function(val, index, array) {
				var timeout;
				eventHandler = function(evt) {
					clearTimeout(timeout);
					if (evt) evt.stopPropagation();
                    this.removeEventListener(transitionEnd, eventHandler, false);
                    $(val).css(clear);
                    var dd = $.data(val, _d)["fx"];
                    dd.splice(dd.indexOf(defer), 1);
                    if(--count == 0) {
                        defer.resolve(c);
                        options.complete.call(val);
                    }
                };
                val.addEventListener(transitionEnd, eventHandler, false);

                var transOptions = ' ' + duration + 's ' + options.ease + ' ' + options.delay + 's',
                    newProps = [],
                    eventHandler;
                newProps['transition'] = 'all' + transOptions;
                for(var prop in properties) newProps[prop] = properties[prop];
                $(val).css(newProps);

				timeout = setTimeout(eventHandler,(duration+options.delay+0.2)*1000);
            });
        }
        return defer;
    }
})(Scout);
(function($, doc, window){
    var settings = {
        tapThreshold: 25,
        dragThreshold: 5,
        swipeThreshold: 50,
        swipeTolerance: 0.85,
        scaleThreshold: 0.05,
        rotateThreshold: 5,
        holdTimeout: 1
    };
    var driverName = null;
    $.touch = {
        /**
         * Set configuration values related to touch support. Available settings are:
         *
         * tapThreshold - The maximum distance a pointer may move and be considered
         *                a tap.
         * dragThreshold - The distance moved before drag events are triggered.
         * swipeThreshold - The distance moved before a swipe event is triggered.
         * swipeTolerance - The minimum dot product between a normalized swipe vector
         *                   and a basis vector to trigger a swipe (higher is less
         *                   tolerant of diagonal swipes; 1 would require a perfect line).
         * scaleThreshold - The minimum delta in % before scale events are triggered.
         * rotateThreshold - The minimum delta in degrees before rotate events are triggered.
         *
         * @param {Object} opts an object containing touch settings
         * @method $.touch.config
         * @for Scout
         */
        config: function(opts) {
            $.extend(settings, opts);
        },
        registerDriver: function(name, callback) {
            if(!driverName && callback($, settings, doc, window)) {
                driverName = name;
            }
        },
        driver: function() {
            return driverName;
        },
        isMultiTouch: function() {
            switch(this.driver()) {
                case "mouse":
                    return false;
                case "msft":
                    return window.navigator.msMaxTouchPoints >= 2;
                default:
                    return true;
            };
        }
    };
    function cancel(e) {
        if(e && typeof e.preventDefault === "function") e.preventDefault();
    }
    /**
     * Disable the native touch scrolling and navigating behavior on
     * the elements. This is often needed when apps want to capture
     * gestures.
     *
     * @method .disableTouchScroll
     * @for Scout
     */
    $.fn.disableTouchScroll = function() {
        this.each(function(el) {
            el.addEventListener("touchmove", cancel);
        });
        this.css("-ms-touch-action", "none");
    }
    /**
     * Re-enable native touch behaviors after a call to .disableTouchScroll()
     *
     * @method .enableTouchScroll
     * @for Scout
     */
    $.fn.enableTouchScroll = function() {
        this.each(function(el) {
            el.removeEventListener("touchmove", cancel);
        });
        $el.css("-ms-touch-action", "auto");
    }
    $.register();
})(Scout, document, window);
$.touch.registerDriver("msft", function($, opts, doc, window) {
    if(!("onmspointerdown" in doc) || !("MSGesture" in window)) return false;
    var state = null,
        gesture = null,
        gestureEvents = ["MSGestureTap","MSGestureHold","MSGestureStart","MSGestureChange"],
        gcount = 0;
    function extract(e, start) {
        var result = {
            target: e.target, screenX: e.screenX, screenY: e.screenY,
            clientX: e.clientX, clientY: e.clientY, distance: 0, id: e.pointerId,
            deltaX: 0, deltaY: 0, distanceSquared: 0,
            distance: function() { return Math.sqrt(this.distanceSquared); },
            originalEvent: e
        };
        if(start) {
            result.deltaX = result.clientX - start.clientX;
            result.deltaY = result.clientY - start.clientY;
            result.distanceSquared = result.deltaX * result.deltaX + result.deltaY * result.deltaY;
        }
        return result;
    }
    var radToDeg = 180 / Math.PI;
    function gextract(e, cur) {
        var dx = e.translationX,
            dy = e.translationY;
        cur.deltaX += dx;
        cur.deltaY += dy;
        cur.screenX += dx;
        cur.screenY += dy;
        cur.clientX += dx;
        cur.clientY += dy;
        cur.distanceSquared = cur.deltaX * cur.deltaX + cur.deltaY * cur.deltaY;
        cur.scale *= e.scale;
        cur.rotation += e.rotation * radToDeg;
        return cur;
    }
    function onGesture(e) {
        if(!state) return;
        state.gesture && (state.gesture = gextract(e, state.gesture));
        var g = state.gesture;
        var $el = $(state.start.target);
        switch(e.type) {
            case "MSGestureStart":
                g = state.gesture = {scale: 1, rotation: 0};
                $.extend(g, state.current);
                break;
            case "MSGestureTap":
                $el.trigger("tap", state.start);
                endGesture();
                break;
            case "MSGestureHold":
                $el.trigger("hold", state.start);
                endGesture();
                break;
            case "MSGestureChange":
                var dx = g.deltaX,
                    dy = g.deltaY,
                    st = opts.swipeThreshold;
                if(!state.isScaling && !state.isRotating && !state.swipe && gcount == 1
                        && (Math.abs(dx) >= st || Math.abs(dy) >= st)) {
                    var mag = g.distance();
                    dx /= mag;
                    dy /= mag;
                    var t = opts.swipeTolerance;
                    if(dx >= t) state.swipe = "right";
                    else if (dx <= -t) state.swipe = "left";
                    else if (dy >= t) state.swipe = "down";
                    else if (dy <= -t) state.swipe = "up";
                    if(state.swipe) {
                        g.direction = state.swipe;
                        $el.trigger("swipe", g);
                        endGesture();
                    }
                }
                if(state.isRotating || Math.abs(g.rotation) >= opts.rotateThreshold) {
                    $el.trigger(state.isRotating ? "rotate" : "rotatestart", g);
                    state.isRotating = true;
                }
                if(state.isScaling || Math.abs(g.scale - 1) >= opts.scaleThreshold) {
                    $el.trigger(state.isScaling ? "scale" : "scalestart", g);
                    state.isScaling = true;
                }
                break;
        }
    }
    function endGesture() {
        if(gesture) {
            gesture.stop();
            for(var i in gestureEvents) {
                doc.removeEventListener(gestureEvents[i], onGesture);
                gesture.target.removeEventListener(gestureEvents[i], onGesture);
            }
            gesture = null;
            gcount = 0;
        }
    }
    doc.addEventListener("MSPointerDown", function(e) {
        state = { start: extract(e) };
        state.current = state.start;
        $(e.target).trigger("pointerdown", state.start);
        if(!gesture) {
            gesture = new MSGesture();
            // gestures must be tracked at the body level so that transformed
            // elements don't mess up pointer tracking
            gesture.target = doc.body;
            for(var i in gestureEvents) {
                gesture.target.addEventListener(gestureEvents[i], onGesture);
            }
        }
        gcount++;
        gesture.addPointer(e.pointerId);
    });
    doc.addEventListener("MSPointerMove", function(e) {
        if(!state || e.pointerId != state.start.id) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        $el.trigger("pointermove", state.current);
        if(state.isDragging || state.current.distanceSquared > opts.dragThreshold * opts.dragThreshold) {
            state.isDragging = true;
            $el.trigger(state.isDragging ? "drag" : "dragstart", state.current);
            var dx = state.current.deltaX,
                dy = state.current.deltaY;
            var st = opts.swipeThreshold;
        }
    });
    doc.addEventListener("MSPointerUp", function(e) {
        if(!state) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        if(state.isDragging) $el.trigger("dragend", state.current);
        if(state.isRotating) $el.trigger("rotateend", state.current);
        if(state.isScaling) $el.trigger("scaleend", state.current);
        $el.trigger("pointerup", state.current);
        endGesture();
        state = null;
    });
    return true;
});
$.touch.registerDriver("apple", function($, opts, doc) {
    if(!("ontouchstart" in doc)) return false;
    var state = null;
    function extract(e, start) {
        if(start) {
            for(var i = 0; i < e.changedTouches.length; i++) {
                if(e.changedTouches[i].identifier == start.id) {
                    t = e.changedTouches[i];
                    break;
                }
            }
        }
        else t = e.changedTouches[0];

        if(!t) return;

        var result = {
            target: t.target, screenX: t.screenX, screenY: t.screenY,
            clientX: t.clientX, clientY: t.clientY, distance: 0, id: t.identifier,
            distance: function() { return Math.sqrt(this.distanceSquared); },
            originalEvent: e
        };
        if(start) {
            result.deltaX = result.clientX - start.clientX;
            result.deltaY = result.clientY - start.clientY;
            result.distanceSquared = result.deltaX * result.deltaX + result.deltaY * result.deltaY;
        }
        return result;
    }
    var holdTimer = null;
    function onHold() {
        if(!state) return;
        $(state.start.target).trigger("hold", state.current);
        holdTimer = null;
        state.isHold = true;
    }
    doc.addEventListener("touchstart", function(e) {
        var start = extract(e);
        if(start && e.touches.length == 1) {
            state = { start: extract(e) };
            state.current = state.start;
            $(e.target).trigger("pointerdown", state.start);
            holdTimer = window.setTimeout(onHold, opts.holdTimeout * 1000);
        }
    });
    doc.addEventListener("touchmove", function(e) {
        if(!state || !(state.current = extract(e, state.start))) return;
        if(e.touches.length != 1) {
            state = null;
            return;
        }
        var $el = $(state.start.target);
        $el.trigger("pointermove", state.current);
        if(state.current.distanceSquared >= opts.tapThreshold * opts.tapThreshold) {
            window.clearTimeout(holdTimer);
            holdTimer = null;
        }
        if(state.isDragging || state.current.distanceSquared >= opts.dragThreshold * opts.dragThreshold) {
            $el.trigger(state.isDragging ? "drag" : "dragstart", state.current);
            state.isDragging = true;
            var dx = state.current.deltaX,
                dy = state.current.deltaY;
            var st = opts.swipeThreshold;
            if(!state.swipe && (Math.abs(dx) >= st || Math.abs(dy) >= st)) {
                var mag = state.current.distance();
                dx /= mag;
                dy /= mag;
                var t = opts.swipeTolerance;
                if(dx >= t) state.swipe = "right";
                else if (dx <= -t) state.swipe = "left";
                else if (dy >= t) state.swipe = "down";
                else if (dy <= -t) state.swipe = "up";
                if(state.swipe) {
                    state.current.direction = state.swipe;
                    $el.trigger("swipe", state.current);
                }
            }
        }
    });
    doc.addEventListener("touchend", function(e) {
        if(!state || !(state.current = extract(e, state.start))) return;
        var $el = $(state.start.target);
        if(state.isDragging) $el.trigger("dragend", state.current);
        $el.trigger("pointerup", state.current);
        if(e.touches.length == 0 && state.current.distanceSquared <= opts.tapThreshold * opts.tapThreshold
            && !state.swipe && !state.isHold) {
            $el.trigger("tap", state.current);
        }
        window.clearTimeout(holdTimer);
        holdTimer = null;
        state = null;
    });

    var gstate = null;
    function gextract(e) {
        return { target: e.target, scale: e.scale, rotation: e.rotation };
    }
    doc.addEventListener("gesturestart", function(e) {
        gstate = { start: gextract(e) };
    });
    doc.addEventListener("gesturechange", function(e) {
        if(!gstate) return;
        gstate.current = gextract(e, gstate.start);
        var $el = $(e.target);
        if(gstate.isScaling || Math.abs(gstate.current.scale - 1) >= opts.scaleThreshold) {
            $el.trigger(gstate.isScaling ? "scale" : "scalestart" , gstate.current);
            gstate.isScaling = true;
        }
        if(gstate.isRotating || Math.abs(gstate.current.rotation) >= opts.rotateThreshold) {
            $el.trigger(gstate.isRotating ? "rotate" : "rotatestart", gstate.current);
            gstate.isRotating = true;
        }
    });
    doc.addEventListener("gestureend", function(e) {
        gstate.current = gextract(e, gstate.start);
        var $el = $(e.target);
        if(gstate.isScaling) $el.trigger("scaleend", gstate.current);
        if(gstate.isRotating) $el.trigger("rotateend", gstate.current);
        gstate = null;
    });
    return true;
});
$.touch.registerDriver("mouse", function($, opts, doc) {
    if(!("onmousedown" in doc)) return false;
    var state = null;
    function extract(e, start) {
        var result = {
            target: e.target, screenX: e.screenX, screenY: e.screenY,
            clientX: e.clientX, clientY: e.clientY, distanceSquared: 0,
            distance: function() { return Math.sqrt(this.distanceSquared); },
            originalEvent: e
        };
        if(start) {
            result.deltaX = result.clientX - start.clientX;
            result.deltaY = result.clientY - start.clientY;
            result.distanceSquared = result.deltaX * result.deltaX + result.deltaY * result.deltaY;
        }
        return result;
    }
    var holdTimer = null;
    function onHold() {
        if(!state) return;
        $(state.start.target).trigger("hold", state.current);
        window.clearTimeout(holdTimer);
        holdTimer = null;
        state.isHold = true;
    }
    doc.addEventListener("mousedown", function(e) {
        state = { start: extract(e) };
        state.current = state.start;
        $(e.target).trigger("pointerdown", state.start);
        holdTimer = window.setTimeout(onHold, opts.holdTimeout * 1000);
    });
    doc.addEventListener("mousemove", function(e) {
        if(!state) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        $el.trigger("pointermove", state.current);
        if(holdTimer && state.current.distanceSquared >= opts.tapThreshold * opts.tapThreshold) {
            window.clearTimeout(holdTimer);
            holdTimer = null;
        }
        if(state.isDragging || state.current.distanceSquared > opts.dragThreshold * opts.dragThreshold) {
            $el.trigger(state.isDragging ? "drag" : "dragstart", state.current);
            state.isDragging = true;
            var dx = state.current.deltaX,
                dy = state.current.deltaY;
            var st = opts.swipeThreshold;
            if(!state.swipe && (Math.abs(dx) >= st || Math.abs(dy) >= st)) {
                var mag = state.current.distance();
                dx /= mag;
                dy /= mag;
                var t = opts.swipeTolerance;
                if(dx >= t) state.swipe = "right";
                else if (dx <= -t) state.swipe = "left";
                else if (dy >= t) state.swipe = "down";
                else if (dy <= -t) state.swipe = "up";
                if(state.swipe) {
                    state.current.direction = state.swipe;
                    $el.trigger("swipe", state.current);
                }
            }
        }
    });
    doc.addEventListener("mouseup", function(e) {
        if(!state) return;
        state.current = extract(e, state.start);
        var $el = $(state.start.target);
        if(state.isDragging) $el.trigger("dragend", state.current);
        $el.trigger("pointerup", state.current);
        if(state.start.target === e.target && !state.swipe && !state.isHold)
            $el.trigger("tap", state.current);
        if(holdTimer) {
            window.clearTimeout(holdTimer);
            holdTimer = null;
        }
        state = null;
    });
    return true;
});
