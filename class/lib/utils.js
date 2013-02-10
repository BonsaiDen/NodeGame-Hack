/**
  * Copyright (c) 2013 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */
var utils = {

    each: function(list, callback, scope) {
        list.slice().forEach(function(item, i) {
            callback.call(scope || null, item, i);
        });
    },

    every: function(list, callback, scope) {
        return list.every(function(item, i) {
            return callback.call(scope || null, item, i);
        });
    },

    some: function(list, callback, scope) {
        return list.some(function(item, i) {
            return callback.call(scope || null, item, i);
        });
    },

    filter: function(list, callback, scope) {
        return list.filter(function(item, i) {
            return callback.call(scope || null, item, i);
        });
    },

    map: function(list, callback, scope) {
        return list.map(function(item, i) {
            return callback.call(scope || null, item, i);
        });
    },

    assert: function(assertion, msg) {
        if (!assertion) {
            throw new Error('Assertion failed: ' + (msg || ''));
        }
    },

    assertType: function(value, type) {
        utils.assert(utils['is' + type](value), 'value is a ' + type);
    },

    assertClass: function(object, clas) {
        var isClass = typeof object.isOfType === 'function';
        utils.assert(isClass && object.isOfType(clas), 'object is a instance of ' + clas);
    },

    isString: function(value) {
        return typeof value === 'string';
    },

    isObject: function(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    },

    isArray: function(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    },

    isBool: function(value) {
        return typeof value === 'boolean';
    },

    isNumber: function(value) {
        return typeof value === 'number' && !isNaN(value);
    },

    guid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    },

    log: function() {

        var params = [this, '>'];
        params.push.apply(params, arguments);

        if (typeof this.getParent === 'function' && this.getParent()) {
            this.getParent().log.apply(this.getParent(), params);

        } else {

            params = utils.map(params, function(p) {

                if (typeof p === 'object'
                    && !(p instanceof Array)
                    && typeof p.toString === 'function') {

                    var s = p.toString();
                    if (s.substring(0, 8) === '[object ') {
                        return p;

                    } else {
                        return '[' + s + ']';
                    }

                } else {
                    return p;
                }

            }, this);

            console.log.apply(console, params);

        }

    }

};

exports.utils = utils;

