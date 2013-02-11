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
var Class = require('../../lib/Class').Class,
    List = require('../../lib/List').List,
    utils = require('../../lib/utils').utils,
    Server = require('../../server/Server').Server,
    Client = require('../Client').Client,
    net = require('../../net');

exports.Game = Class(function() {

    this._port = null;
    this._host = null;
    this._isLocal = false;

    this._client = null;
    this._server = null;

}, {

    connect: function(port, host, local) {

        utils.assertType(host, 'String');
        utils.assertType(port, 'Number');

        this._port = port;
        this._host = host;
        this._isLocal = !!local;

        if (this._client) {
            this._client.unbind('connection');
            this._client.unbind('event');
            this._client.unbind('error');
            this._client.unbind('close');
            this._client.stop();
        }

        if (this._server) {
            this._server.stop();
        }

        if (local) {
            this._server = new Server(port, host, local);
            this._server.start();
        }

        this._client = new Client(port, host, local);

        this._client.on('connection', this.onConnection, this);
        this._client.on('event', this.onEvent, this);
        this._client.on('error', this.onError, this);
        this._client.on('close', this.onClose, this);

        this._client.start();


    },

    onConnection: function() {

        this.log('Connected');

        this._client.command(net.Command.Login, 'BonsaiDen').success(function() {

        }).error(function() {
            this.log('Failed to login');

        }, this);

    },

    onEvent: function(event) {
        this.log('Event', event);
    },

    onError: function(reason, code) {
        this.log('Connection Failed', reason, code);
    },

    onClose: function(byRemote, reason, code) {
        this.log('Connection Closed ', byRemote, reason, code);
    },


    // Helpers ----------------------------------------------------------------
    now: function() {
        return this._client.now();
    },

    log: function() {
        utils.log.apply(this, arguments);
    },

    toString: function() {
        return 'Game ' + this._host + ':' + this._port;
    }

});

