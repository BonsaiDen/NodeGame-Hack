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
    Emitter = require('../../lib/Emitter').Emitter,
    List = require('../../lib/List').List;


// Lithium Remote Emulation ---------------------------------------------------
var Remote = Class(function(server, socket, version, client) {

    this._server = server;
    this._client = client;
    this._isPending = true;

    this.id = socket.remoteAddress + ':' + socket.remotePort;
    this.address = socket.remoteAddress;
    this.port = socket.remotePort;
    this.bytesSend = 0;
    this.bytesReceived = 0;
    this.version = version;

    Emitter(this);

}, Emitter, {

    accept: function() {

        if (this._isPending) {
            this._isPending = false;
            return true;

        } else {
            return false;
        }

    },

    reject: function(reason) {

        if (this._isPending) {
            this._isPending = false;
            this.close(reason);
            return true;

        } else {
            return false;
        }

    },

    isPending: function() {
        return this._isPending;
    },

    send: function(data) {
        this._server.sendToClient(this._client, data);
    },

    close: function(reason) {
        this._server.closeByRemote(this._client, reason);
    },

    toString: function() {
        return '[Remote ' + this.id + ' Version ' + this.version + ']';
    }

});


// Local Server and Client Abstraction ----------------------------------------
var serverMap = {};

exports.Server = Class(function(callback, encoder, decoder) {

    this._id = null;
    this._clients = new List();
    this._remotes = {};
    this._encoder = encoder || function(msg) { return msg; };
    this._decoder = decoder || function(msg) { return msg; };

    Emitter(this);

}, Emitter, {

    listen: function(port, host) {
        this._id = port + ':' + host;
        serverMap[this._id] = this;
    },

    close: function() {
        delete serverMap[this._id];
    },

    // Local Abstraction ------------------------------------------------------
    addClient: function(client) {

        if (this._clients.add(client)) {

            var remote = new Remote(this, {
                remoteAddress: '127.0.0.1',
                remotePort: 1025 + Math.floor(Math.random() * 65536)

            }, 17, client);

            this._remotes[client.id] = remote;

            this.emit('connection', remote);

        }

    },

    sendToRemote: function(client, data) {
        var remote = this._remotes[client.id];
        remote.emit('message', this._decoder(data));
    },

    sendToClient: function(client, data) {
        client._receive(this._encoder(data));
    },

    closeByRemote: function(client, reason) {
        this.removeClient(client, reason);
    },

    closeByClient: function(client) {
        this.removeClient(client);
    },

    removeClient: function(client, reason) {

        if (this._clients.remove(client)) {

            var remote = this._remotes[client.id];
            delete this._remotes[client.id];
            client._close(reason);
            remote.emit('close', reason);

        }

    }

});


exports.Client = Class(function(callback, encoder, decoder) {

    this.id = ++exports.Client.id;
    this._server = null;
    this._isConnected = false;
    this._wasConnected = false;
    this._closedByRemote = true;
    this._encoder = encoder || function(msg) { return msg; };
    this._decoder = decoder || function(msg) { return msg; };
    this._delay = 0;

    Emitter(this);

}, Emitter, {

    $id: 0,

    // Public -----------------------------------------------------------------
    connect: function(port, host) {

        if (this._isConnected) {
            return false;
        }

        var id = port + ':' + host;
        if (serverMap.hasOwnProperty(id)) {
            this._server = serverMap[id];
            this._connectSuccess();

        } else {
            this._connectFail();
        }

        return true;

    },

    isConnected: function() {
        return !!this._server;
    },

    wasConnected: function() {
        return this._wasConnected;
    },

    send: function(data) {

        if (!this.isConnected()) {
            return false;

        } else {

            var that = this;
            setTimeout(function() {
                that._send(data);

            }, this._delay);

            return true;

        }

    },

    close: function() {

        if (!this.isConnected()) {
            return false;

        } else {
            this._closedByRemote = false;
            this._server.closeByClient(this);
            return true;
        }

    },

    setDelay: function(delay) {
        this._delay = delay;
    },

    // Private ----------------------------------------------------------------
    _connectSuccess: function() {
        this._isConnected = true;
        this._server.addClient(this);
        this.emit('connection');
    },

    _connectFail: function() {
        this._close();
    },

    _send: function(data) {
        this._server.sendToRemote(this, this._encoder(data));
    },

    _receive: function(data) {

        var that = this;
        setTimeout(function() {
            that.emit('message', that._decoder(data));

        }, this._delay);

    },

    _close: function(reason) {
        this._wasConnected = this._isConnected;
        this._isConnected = false;
        this.emit('close', this._closedByRemote, reason || '', 1030);
    }

});

