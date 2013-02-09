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
    this._networks = new List();

    var server = require(local ? '../client/lib/Server' : './lib/lithium');
    this._interface = new server.Server();
    this._interface.on('connection', this._onConnect.bind(this));

}, {

    $Action: {

        // A list of networks with free/total slots (full ones might be joined as observer)
        NetworkList: 1000,

        // Update for a network (players, slots, ready status)
        NetworkInfo: 1003,

        // Network was started (initial state to follow)
        NetworkStarted: 1004,

        // A client joined a network (client, slot, observer)
        ClientJoined: 1005,

        // A client left a network (client, slot, observer)
        ClientLeft: 1006,

        // A Network is finished (status)
        NetworkDone: 1007

    },

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

            that._clients.each(function(client) {

                if (!client.isPlaying()) {
                    client.update();
                }

            }, that);

            while(elapsed >= tickDuration) {

                that._networks.each(function(network) {

                    if (network.isEmpty()) {
                        network.destroy(that);
                        that._networks.remove(network);
                        //that.networkList();

                    } else {
                        network.update();
                    }

                }, that);

                elapsed -= tickDuration;

            }

        }, tickDuration);

    },

    stop: function() {
        clearTimeout(this._interval);
        this._interface.close();
        this.log('Stopped');
    },

    //sendToAll: function(msg) {
        //this._clients.each(function(client) {
            //if (!client.isPlaying()) {
                //client.send(msg);
            //}
        //});
    //},

    //sendToNetwork: function(network, msg) {
        //network.getChildListFor('Client').each(function(client) {
            //if (!client.isPlaying()) {
                //client.send(msg);
            //}
        //});
    //},


    // Network Actions --------------------------------------------------------
    //networkList: function() {
        //this.sendToAll({
            //type: Server.Action.NetworkList,
            //data: []
        //});
    //},

    //networkInfo: function(network) {
        //utils.assert(network.isOfType('Network'), 'network is a Network');
        //this.sendToNetwork(network, {});
    //},

    //clientJoined: function(network, client) {
        //utils.assert(network.isOfType('Network'), 'network is a Network');
        //utils.assert(client.isOfType('RemoteClient'), 'client is a RemoteClient');

    //},

    //clientLeft: function(network, client) {
        //utils.assert(network.isOfType('Network'), 'network is a Network');
        //utils.assert(client.isOfType('RemoteClient'), 'client is a RemoteClient');

    //},

    //networkStarted: function(network) {
        //utils.assert(network.isOfType('Network'), 'network is a Network');

    //},

    //networkDone: function(network) {
        //utils.assert(network.isOfType('Network'), 'network is a Network');

    //},

    //initNetwork: function(creator, mapName) {

        //utils.assert(typeof mapName === 'string', 'mapName is a string');
        //utils.assert(creator.isOfType('RemoteClient'), 'creator is a RemoteClient');

        //var network = new Network(this);
        //network.loadFromFile(this.getMapFile(mapName));

        //this._networks.add(network);

    //},

    //joinNetwork: function(client) {

    //},

    //startNetwork: function(client, network) {

    //},

    //loadMap: function() {

    //},


    // Getter / Setter --------------------------------------------------------
    //getMapFile: function(mapName) {
    //},


    // Private ----------------------------------------------------------------
    _onConnect: function(remote) {

        this.log('Remote', remote);
        var clients = this._clients,
            client = new Client(this, remote);

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

