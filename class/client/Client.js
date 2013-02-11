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
    List = require('../lib/List').List,
    utils = require('../lib/utils').utils,
    Promise = require('./Promise').Promise,
    Event = require('../server/Event').Event,
    net = require('../net');

exports.Client = Class(function(port, host, local) {

    utils.assertType(host, 'String');
    utils.assertType(port, 'Number');

    this._port = port;
    this._host = host;
    this._isLocal = !!local;

    this._eventId = 0;
    this._events = {};

    var client = require(this._isLocal ? './lib/Server' : './lib/lithium');
    this._interface = new client.Client(null, JSON.stringify, JSON.parse);

}, {

    // Actions ----------------------------------------------------------------
    start: function() {
        this._interface.on('connection', this._connection, this);
        this._interface.on('message', this._message, this);
        this._interface.on('close', this._close, this);
        this._interface.connect(this._port, this._host);
    },

    stop: function() {
        this._interface.close();
    },

    // TODO add command() method which encapsulates the promise code
    // so send() can be used for low level calls
    send: function(code, data) {

        var event = new Event(++this._eventId, code,
                                data !== undefined ? data : null);

        this._interface.send(event.toArray());
        return this._events[event.id] = new Promise();

    },


    // Network Handlers -------------------------------------------------------
    _connection: function() {

        this.log('Connected');
        this.send(net.Command.Login, 'BonsaiDen').success(function() {

        }).error(function() {
            this.log('Failed to login');

        }, this);

    },

    _message: function(msg) {

        var event = Event.fromArray(msg);
        if (event) {

            // Handle responses to messages that were send
            if (this._events.hasOwnProperty(event.id)) {
                this.log('Response', event);

                var promise = this._events[event.id];
                if (net.ErrorCodes.indexOf(event.code) !== -1) {
                    promise.reject(event);

                } else {
                    promise.resolve(event);
                }

                delete this._events[event.id];

            } else {
                this.log('Event', event);
            }

        } else {
            this.log('Invalid message', msg);
        }

    },

    _close: function(byRemote, reason, code) {

        if (this._interface.wasConnected()) {
            this.log('Disconnected ', byRemote, reason, code);

        } else {
            this.log('Connection Failed', reason, code);
        }

    },


    // Helpers ----------------------------------------------------------------
    log: function() {
        utils.log.apply(this, arguments);
    },

    toString: function() {
        return 'LocalClient ' + this._host + ':' + this._port;
    }

});

