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
var Class = require('../lib/Class').Class,
    utils = require('../lib/utils').utils,
    net = require('./net');

var NetworkEvent = Class(function(id, code, data) {
    utils.assert(utils.isNumber(id), 'id is a number');
    utils.assert(id > 0, 'id is greater than 0');
    utils.assert(utils.isNumber(code), 'code is a number');
    utils.assert(net.All.indexOf(code) !== -1, 'code is valid code');

    this.id = id;
    this.code = code;
    this.data = data;

}, {

    $fromArray: function(array) {

        if (Array.isArray(array) && array.length === 3) {
            if (utils.isNumber(array[0]) && utils.isNumber(array[1])) {
                if (array[0] > 0 && net.All.indexOf(array[1]) !== -1) {
                    return new NetworkEvent(array[0], array[1], array[2]);
                }
            }
        }

        return null;

    },

    toArray: function() {
        return [this.id, this.code, this.data];
    },

    isOfType: function(type) {
        return type === 'NetworkEvent';
    },

    toString: function() {
        return 'NetworkEvent id:' + this.id + ' code:' + this.code;
    }

});

exports.NetworkEvent = NetworkEvent;

