//     deferred.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

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
