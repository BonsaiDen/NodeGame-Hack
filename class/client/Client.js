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
    Emitter = require('../lib/Emitter').Emitter,
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
    this._pendingCommands = new List();
    this._syncOffset = 0;

    Emitter(this);

    var client = require(this._isLocal ? './lib/Server' : './lib/lithium');
    this._interface = new client.Client(null, JSON.stringify, JSON.parse);

}, Emitter, {

    // Actions ----------------------------------------------------------------
    start: function() {
        this._interface.on('connection', this._connection, this);
        this._interface.on('message', this._message, this);
        this._interface.on('close', this._close, this);
        this._interface.connect(this._port, this._host);
        this.emit('start');
    },

    stop: function() {
        this.emit('stop');
        this._interface.unbind('connection');
        this._interface.unbind('message');
        this._interface.unbind('close');
        this._interface.close();
    },


    // Server Interaction ----------------------------------------------------
    command: function(code, data) {
        var event = this.send(code, data, ++this._eventId);
        event.promise = new Promise();
        this._pendingCommands.add(event);
        return event.promise;
    },

    action: function(data) {

    },

    send: function(code, data, id) {
        var event = new Event(id || -1, code, data);
        this._interface.send(event.toArray());
        this.log('Sent', event, data);
        return event;
    },


    // Getter / Setter --------------------------------------------------------
    isLocal: function() {
        return this._isLocal;
    },

    isConnected: function() {
        return this._interface.isConnected();
    },


    // Network Handlers -------------------------------------------------------
    _connection: function() {
    },

    _message: function(msg) {

        var event = Event.fromArray(msg),
            events = this._pendingCommands;

        if (event) {

            // Handle server responses
            if (events.has(event)) {

                this.log('Command Response', event);

                var promise = events.get(event).promise;
                if (net.ErrorCodes.indexOf(event.code) !== -1) {
                    promise.reject(event);

                } else {
                    promise.resolve(event);
                }

                events.remove(event);

            // Handle low level events right here
            } else if (event.code === net.Sync.ServerStart) {
                this.log('Sync > Started', event);
                this.send(net.Sync.ClientResponse, [event.data, Date.now()]);

            } else if (event.code === net.Sync.ServerResponse) {
                this.log('Sync > Response ', event);
                this.send(net.Sync.Done, [
                    event.data[0],
                    event.data[1],
                    event.data[2],
                    Date.now()
                ]);

            } else if (event.code === net.Sync.Result) {

                var diff = this._syncOffset = event.data;
                this.log('Sync > Done', diff >= 0
                                        ? 'ahead by ' + diff + 'ms'
                                        : 'behind by ' + Math.abs(diff) + 'ms');

                this.emit('connection');

            } else if (net.GameCodes.indexOf(event.code) !== -1) {
                this.emit('event', event);

            } else {
                this.log('Unkown event', msg);
            }

        } else {
            this.log('Invalid message', msg);
        }

    },

    _close: function(byRemote, reason, code) {

        if (this._interface.wasConnected()) {
            this.emit('close', byRemote, reason, code);

        } else {
            this.emit('failure', reason, code);
        }

    },


    // Helpers ----------------------------------------------------------------
    now: function() {
        return Date.now() - this._syncOffset;
    },

    log: function() {
        utils.log.apply(this, arguments);
    },

    toString: function() {
        return 'LocalClient ' + this._host + ':' + this._port;
    }

});

