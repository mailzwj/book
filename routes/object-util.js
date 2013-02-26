


(function (S, undefined) {

    var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR',
        STAMP_MARKER = '__~ks_stamped',
        host = this,
        TRUE = true,
        EMPTY = '',
        ObjectCreate = Object.create,
    // error in native ie678, not in simulated ie9
        hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];

    mix(S, {
        /**
         * stamp a object by guid
         * @param {Object} o object needed to be stamped
         * @param {Boolean} [readOnly] while set marker on o if marker does not exist
         * @param {String} [marker] the marker will be set on Object
         * @return {String} guid associated with this object
         * @member KISSY
         */
        stamp: function (o, readOnly, marker) {
            if (!o) {
                return o
            }
            marker = marker || STAMP_MARKER;
            var guid = o[marker];
            if (guid) {
                return guid;
            } else if (!readOnly) {
                try {
                    guid = o[marker] = S.guid(marker);
                }
                catch (e) {
                    guid = undefined;
                }
            }
            return guid;
        },


        /**
         * Get all the property names of o as array
         * @param {Object} o
         * @return {Array}
         * @member KISSY
         */
        keys: function (o) {
            var result = [], p, i;

            for (p in o) {
                result.push(p);
            }

            if (hasEnumBug) {
                for (i = enumProperties.length - 1; i >= 0; i--) {
                    p = enumProperties[i];
                    if (o.hasOwnProperty(p)) {
                        result.push(p);
                    }
                }
            }

            return result;
        },


        /**
         * Copies all the properties of s to r.
         * @method
         * @param {Object} r the augmented object
         * @param {Object} s the object need to augment
         * @param {Boolean|Object} [ov=TRUE] whether overwrite existing property or config.
         * @param {Boolean} [ov.overwrite=TRUE] whether overwrite existing property.
         * @param {String[]} [ov.whitelist] array of white-list properties
         * @param {Boolean}[ov.deep=false] whether recursive mix if encounter object.
         * @param {String[]} [wl] array of white-list properties
         * @param [deep=false] {Boolean} whether recursive mix if encounter object.
         * @return {Object} the augmented object
         * @member KISSY
         *
         * for example:
         *     @example
         *     var t = {};
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE}) => {x: {y: 3, z: 4, a: {}}}, a !== t
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE, overwrite: false}) => {x: {y: 2, z: 4, a: {}}}, a !== t
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, 1) => {x: {y: 3, a: t}}
         */
        mix: function (r, s, ov, wl, deep) {
            if (typeof ov === 'object') {
                wl = ov['whitelist'];
                deep = ov['deep'];
                ov = ov['overwrite'];
            }
            var cache = [],
                c,
                i = 0;
            mixInternal(r, s, ov, wl, deep, cache);
            while (c = cache[i++]) {
                delete c[MIX_CIRCULAR_DETECTION];
            }
            return r;
        },

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @param {...Object} var_args objects need to be merged
         * @return {Object} the new merged object
         * @member KISSY
         */
        merge: function (var_args) {
            var_args = S.makeArray(arguments);
            var o = {},
                i,
                l = var_args.length;
            for (i = 0; i < l; i++) {
                S.mix(o, var_args[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @param   {Object} r received object
         * @param   {...Object} var_args object need to  augment
         *          {Boolean} [ov=TRUE] whether overwrite existing property
         *          {String[]} [wl] array of white-list properties
         * @return  {Object} the augmented object
         * @member KISSY
         */
        augment: function (r, var_args) {
            var args = S.makeArray(arguments),
                len = args.length - 2,
                i = 1,
                ov = args[len],
                wl = args[len + 1];

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }
            if (!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for (; i < len; i++) {
                S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param {Object} [px] prototype properties to add/override
         * @param {Object} [sx] static properties to add/override
         * @return r {Object}
         * @member KISSY
         */
        extend: function (r, s, px, sx) {
            if (!s || !r) {
                return r;
            }

            var sp = s.prototype,
                rp;

            // add prototype chain
            rp = createObject(sp, r);
            r.prototype = S.mix(rp, r.prototype);
            r.superclass = createObject(sp, s);

            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }

            return r;
        },


        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         *
         * for example:
         *      @example
         *      S.namespace('KISSY.app'); // returns KISSY.app
         *      S.namespace('app.Shop'); // returns KISSY.app.Shop
         *      S.namespace('TB.app.Shop', TRUE); // returns TB.app.Shop
         *
         * @return {Object}  A reference to the last namespace object created
         * @member KISSY
         */
        namespace: function () {
            var args = S.makeArray(arguments),
                l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === TRUE && l--);

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        }

    });

    function Empty() {
    }

    function createObject(proto, constructor) {
        var newProto;
        if (ObjectCreate) {
            newProto = ObjectCreate(proto);
        } else {
            Empty.prototype = proto;
            newProto = new Empty();
        }
        newProto.constructor = constructor;
        return newProto;
    }

    function mix(r, s) {
        for (var i in s) {
            r[i] = s[i];
        }
    }

    function mixInternal(r, s, ov, wl, deep, cache) {
        if (!s || !r) {
            return r;
        }

        if (ov === undefined) {
            ov = TRUE;
        }

        var i = 0, p, keys, len;

        // 记录循环标志
        s[MIX_CIRCULAR_DETECTION] = r;

        // 记录被记录了循环标志的对像
        cache.push(s);

        if (wl) {
            len = wl.length;
            for (i = 0; i < len; i++) {
                p = wl[i];
                if (p in s) {
                    _mix(p, r, s, ov, wl, deep, cache);
                }
            }
        } else {
            // mix all properties
            keys = S.keys(s);
            len = keys.length;
            for (i = 0; i < len; i++) {
                p = keys[i];
                if (p != MIX_CIRCULAR_DETECTION) {
                    // no hasOwnProperty judge!
                    _mix(p, r, s, ov, wl, deep, cache);
                }
            }
        }

        return r;
    }

    function _mix(p, r, s, ov, wl, deep, cache) {
        // 要求覆盖
        // 或者目的不存在
        // 或者深度mix
        if (ov || !(p in r) || deep) {
            var target = r[p],
                src = s[p];
            // prevent never-end loop
            if (target === src) {
                // S.mix({},{x:undefined})
                if (target === undefined) {
                    r[p] = target;
                }
                return;
            }
            // 来源是数组和对象，并且要求深度 mix
            if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                if (src[MIX_CIRCULAR_DETECTION]) {
                    r[p] = src[MIX_CIRCULAR_DETECTION];
                } else {
                    // 目标值为对象或数组，直接 mix
                    // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                    var clone = target && (S.isArray(target) || S.isPlainObject(target)) ?
                        target :
                        (S.isArray(src) ? [] : {});
                    r[p] = clone;
                    mixInternal(clone, src, ov, wl, TRUE, cache);
                }
            } else if (src !== undefined && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
})(exports);

/**
 * @ignore
 * @fileOverview array utilities of lang
 * @author yiminghe@gmail.com
 *
 */
(function (S, undefined) {

    var TRUE = true,
        AP = Array.prototype,
        indexOf = AP.indexOf,
        lastIndexOf = AP.lastIndexOf,
        filter = AP.filter,
        every = AP.every,
        some = AP.some,
        map = AP.map,
        FALSE = false;

    S.mix(S, {
        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param {Object} [context]
         * @member KISSY
         */
        each: function (object, fn, context) {
            if (object) {
                var key,
                    val,
                    keys,
                    i = 0,
                    length = object && object.length,
                    isObj = length === undefined || S.type(object) === 'function';

                context = context || null;

                if (isObj) {
                    keys = S.keys(object);
                    for (; i < keys.length; i++) {
                        key = keys[i];
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === FALSE) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0];
                         i < length && fn.call(context, val, i, object) !== FALSE; val = object[++i]) {
                    }
                }
            }
            return object;
        },

        /**
         * Search for a specified value within an array.
         * @param item individual item to be searched
         * @method
         * @member KISSY
         * @param {Array} arr the array of items where item will be search
         * @return {number} item's index in array
         */
        indexOf: indexOf ?
            function (item, arr) {
                return indexOf.call(arr, item);
            } :
            function (item, arr) {
                for (var i = 0, len = arr.length; i < len; ++i) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },

        /**
         * Returns the index of the last item in the array
         * that contains the specified value, -1 if the
         * value isn't found.
         * @method
         * @param item individual item to be searched
         * @param {Array} arr the array of items where item will be search
         * @return {number} item's last index in array
         * @member KISSY
         */
        lastIndexOf: (lastIndexOf) ?
            function (item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function (item, arr) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] === item) {
                        break;
                    }
                }
                return i;
            },

        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of unique for
         * @param [override] {Boolean} if override is TRUE, S.unique([a, b, a]) => [b, a].
         * if override is FALSE, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         * @member KISSY
         */
        unique: function (a, override) {
            var b = a.slice();
            if (override) {
                b.reverse();
            }
            var i = 0,
                n,
                item;

            while (i < b.length) {
                item = b[i];
                while ((n = S.lastIndexOf(item, b)) !== i) {
                    b.splice(n, 1);
                }
                i += 1;
            }

            if (override) {
                b.reverse();
            }
            return b;
        },

        /**
         * Search for a specified value index within an array.
         * @param item individual item to be searched
         * @param {Array} arr the array of items where item will be search
         * @return {Boolean} the item exists in arr
         * @member KISSY
         */
        inArray: function (item, arr) {
            return S.indexOf(item, arr) > -1;
        },

        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned TRUE for.
         * @member KISSY
         * @method
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @return {Array} The items on which the supplied function returned TRUE.
         * If no items matched an empty array is returned.
         * @member KISSY
         */
        filter: filter ?
            function (arr, fn, context) {
                return filter.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var ret = [];
                S.each(arr, function (item, i, arr) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },


        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned for.
         * @method
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
         * @return {Array} The items on which the supplied function returned
         * @member KISSY
         */
        map: map ?
            function (arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = typeof arr == 'string' ? arr.charAt(i) : arr[i];
                    if (el
                        ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },


        /**
         * Executes the supplied function on each item in the array.
         * Returns a value which is accumulation of the value that the supplied
         * function returned.
         *
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param initialValue {number} optional context object
         * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
         * @return {Array} The items on which the supplied function returned
         * @member KISSY
         */
        reduce: /*
         NaN ?
         reduce ? function(arr, callback, initialValue) {
         return arr.reduce(callback, initialValue);
         } : */function (arr, callback, initialValue) {
            var len = arr.length;
            if (typeof callback !== 'function') {
                throw new TypeError('callback is not function!');
            }

            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length == 2) {
                throw new TypeError('arguments invalid');
            }

            var k = 0;
            var accumulator;
            if (arguments.length >= 3) {
                accumulator = arguments[2];
            }
            else {
                do {
                    if (k in arr) {
                        accumulator = arr[k++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    k += 1;
                    if (k >= len) {
                        throw new TypeError();
                    }
                }
                while (TRUE);
            }

            while (k < len) {
                if (k in arr) {
                    accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
                }
                k++;
            }

            return accumulator;
        },

        /**
         * Tests whether all elements in the array pass the test implemented by the provided function.
         * @method
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @member KISSY
         * @return {Boolean} whether all elements in the array pass the test implemented by the provided function.
         */
        every: every ?
            function (arr, fn, context) {
                return every.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && !fn.call(context, arr[i], i, arr)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

        /**
         * Tests whether some element in the array passes the test implemented by the provided function.
         * @method
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @member KISSY
         * @return {Boolean} whether some element in the array passes the test implemented by the provided function.
         */
        some: some ?
            function (arr, fn, context) {
                return some.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && fn.call(context, arr[i], i, arr)) {
                        return TRUE;
                    }
                }
                return FALSE;
            },
        /**
         * Converts object to a TRUE array.
         * @param o {object|Array} array like object or array
         * @return {Array} native Array
         * @member KISSY
         */
        makeArray: function (o) {
            if (o == null) {
                return [];
            }
            if (S.isArray(o)) {
                return o;
            }

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number'
                // form.elements in ie78 has nodeName 'form'
                // then caution select
                // || o.nodeName
                // window
                || o.alert
                || typeof o == 'string'
                || S.isFunction(o)) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        }
    });

})(exports);

/**
 * @ignore
 * @fileOverview object utilities of lang
 * @author yiminghe@gmail.com
 *
 */
/**
 * @ignore
 * @fileOverview   type of land
 * @author  lifesinger@gmail.com, yiminghe@gmail.com
 *
 */
(function (S, undefined) {
    // [[Class]] -> type pairs
    var class2type = {},
        FALSE = false,
        OP = Object.prototype,
        toString = OP.toString;

    function hasOwnProperty(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    S.mix(S,
        {
            /**
             * test whether o is boolean
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isBoolean: 0,
            /**
             * test whether o is number
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isNumber: 0,
            /**
             * test whether o is String
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isString: 0,
            /**
             * test whether o is function
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isFunction: 0,
            /**
             * test whether o is Array
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isArray: 0,
            /**
             * test whether o is Date
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isDate: 0,
            /**
             * test whether o is RegExp
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isRegExp: 0,
            /**
             * test whether o is Object
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isObject: 0,

            /**
             * Determine the internal JavaScript [[Class]] of an object.
             * @member KISSY
             */
            type: function (o) {
                return o == null ?
                    String(o) :
                    class2type[toString.call(o)] || 'object';
            },

            /**
             * whether o === null
             * @param o
             * @member KISSY
             */
            isNull: function (o) {
                return o === null;
            },

            /**
             * whether o === undefined
             * @param o
             * @member KISSY
             */
            isUndefined: function (o) {
                return o === undefined;
            },

            /**
             * Checks to see if an object is empty.
             * @member KISSY
             */
            isEmptyObject: function (o) {
                for (var p in o) {
                    if (p !== undefined) {
                        return FALSE;
                    }
                }
                return true;
            },

            /**
             * Checks to see if an object is a plain object (created using '{}'
             * or 'new Object()' but not 'new FunctionClass()').
             * @member KISSY
             */
            isPlainObject: function (obj) {
                // credits to jq

                // Must be an Object.
                // Because of IE, we also have to check the presence of the constructor property.
                // Make sure that DOM nodes and window objects don't pass through, as well
                if (!obj || S.type(obj) !== "object" || obj.nodeType || obj.window == obj) {
                    return FALSE;
                }

                try {
                    // Not own constructor property must be Object
                    if (obj.constructor &&
                        !hasOwnProperty(obj, "constructor") &&
                        !hasOwnProperty(obj.constructor.prototype, "isPrototypeOf")) {
                        return FALSE;
                    }
                } catch (e) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return FALSE;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.

                var key;
                for (key in obj) {
                }

                return key === undefined || hasOwnProperty(obj, key);
            }
        });

    S.each('Boolean Number String Function Array Date RegExp Object'.split(' '),
        function (name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function (o) {
                return S.type(o) == lc;
            }
        });

})(exports);