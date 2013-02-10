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
    Game = require('./Game').Game,
    Client = require('./Client').Client,
    NetworkEvent = require('./NetworkEvent').NetworkEvent,
    utils = require('../lib/utils').utils;

var Server = Class(function(port, host, local) {

    utils.assertType(host, 'String');
    utils.assertType(port, 'Number');

    this._port = port;
    this._host = host;

    this._ticksPerSecond = 20;
    this._lastTickTime = 0;
    this._elapsedTickTime = 0;
    this._tickDuration = Math.floor(1000 / this._ticksPerSecond);

    this._clients = new List();
    this._games = new List();

    var server = require(local ? '../client/lib/Server' : './lib/lithium');
    this._interface = new server.Server(null, JSON.stringify, JSON.parse);
    this._interface.on('connection', this._onConnect.bind(this));

}, {

    // Actions ----------------------------------------------------------------
    start: function() {

        this._interface.listen(this._port, this._host);

        this._lastTickTime = Date.now();
        this._elapsedTickTime = this._tickDuration;
        this._interval = setInterval(this.update.bind(this), this._tickDuration);

        this.log('Started');
        this.update();

    },

    update: function() {

        var now = Date.now();
        this._elapsedTickTime += now - this._lastTickTime;
        this._lastTickTime = now;

        this._clients.each(function(client) {

            if (!client.isPlaying()) {
                client.update();
            }

        }, this);

        while(this._elapsedTickTime >= this._tickDuration) {

            this._games.each(function(game) {

                if (game.isEmpty()) {
                    game.destroy(this);
                    this.removeGame(game);
                    //this.gameList(); // TODO update game list

                } else {
                    game.update();
                }

            }, this);

            this._elapsedTickTime -= this._tickDuration;

        }

    },

    stop: function() {
        clearTimeout(this._interval);
        this._interface.close();
        this.log('Stopped');
    },


    // Getter / Setter --------------------------------------------------------
    addGame: function(game) {
        utils.assertClass(game, 'Game');
        this._games.add(game);
        // TODO send game list to clients
    },

    getGameById: function(guid) {

        var games = utils.filter(this._games, function(game) {
            return game.getGuid() === guid;
        });

        utils.assert(games.length <= 1, '<= 1 games found for guid');

        return games[0];

    },

    removeGame: function(game) {
        utils.assertClass(game, 'Game');
        this._games.remove(game);
        // TODO send game list to clients
    },


    // Private ----------------------------------------------------------------
    _onConnect: function(remote) {

        this.log('Remote', remote);
        var clients = this._clients,
            client = new Client(this, remote);

        remote.on('message', function(msg) {

            var event = NetworkEvent.fromArray(msg);
            if (event) {
                client.onEvent(event);

            } else {
                console.log('Invalid message:', msg);
            }

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

