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
    Network = require('./Network').Network,
    Client = require('./Client').Client;

var Server = Class(function(port, host, local) {

    utils.assert(typeof host === 'string', 'host is a string');
    utils.assert(typeof port === 'number' && !isNaN(port), 'port is a number');

    this._port = port;
    this._host = host;
    this._ticksPerSecond = 10;

    this._clients = new List();
    this._network = new Network();
    this._network.loadFromFile('./data/map.json');

    var server = require(local ? '../client/lib/Server' : './lib/lithium');
    this._interface = new server.Server();
    this._interface.on('connection', this._onConnect.bind(this));

}, {

    // Actions ----------------------------------------------------------------
    start: function() {

        this._interface.listen(this._port, this._host);
        this.log('Started');

        var that = this,
            lastTick = Date.now(),
            elapsed = 0,
            tickDuration = Math.floor(1000 / this._ticksPerSecond);

        this._interval = setInterval(function() {

            var now = Date.now();
            elapsed += now - lastTick;
            lastTick = now;

            while(elapsed >= tickDuration) {
                that._network.update();
                elapsed -= tickDuration;
            }

        }, tickDuration);

    },

    stop: function() {
        clearTimeout(this._interval);
        this._interface.close();
        this.log('Stopped');
    },


    // Private ----------------------------------------------------------------
    _onConnect: function(remote) {

        this.log('Remote', remote);
        var clients = this._clients,
            client = new Client(remote);

        remote.on('message', function(msg) {
            client.onMessage(msg);
        });

        remote.on('close', function() {

            if (client) {
                client.onClose();
                clients.remove(client);
                client = null;
            }

        });

        clients.add(client);

    },


    // Helpers ----------------------------------------------------------------
    log: function() {
        utils.log.apply(this, arguments);
    },

    assert: function(assertion, msg) {
        utils.assert(assertion, msg);
    },

    toString: function() {
        return 'Server at ' + this._host + ':' + this._port;
    }

});

exports.Server = Server;

