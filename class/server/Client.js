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
    Event = require('./Event').Event,
    utils = require('../lib/utils').utils,
    net = require('../net');

var Client = Class(function(server, remote) {

    this._server = server;
    this._remote = remote;
    this._game = null;
    this._player = null;
    this._state = Client.State.Login;
    this._synced = false;
    this._events = [];
    this.id = ++Client.id;

    this.log('Connected via', remote);

}, {

    $State: {
        Syncing: 0,
        Login: 1,
        Server: 2,
        Lobby: 3,
        Game: 4
    },

    $id: 0,

    // Actions ----------------------------------------------------------------
    update: function() {
        utils.each(this._events, this.updateEvent, this);
        this._events.length = 0;
    },

    updateEvent: function(event) {

        var game,
            code = event.code,
            state = this.getState();

        if (state === Client.State.Login) {

            if (code === net.Command.Login) {
                // validate username
                // TODO persona login later on
                this.invalid(event);

            } else {
                this.invalid(event);
            }


        // Server Menu --------------------------------------------------------
        // --------------------------------------------------------------------
        } else if (state === Client.State.Server) {

            // Create
            if (code === net.Command.Create) {

                // check map, and stuff or so...
                // TODO create game
                this.join(game);
                //this.send(net.Client.Joined, [
                    //game.getGuid()
                //]);

            // Join
            } else if (code === net.Command.Join) {

                //utils.assertClass(game, 'Game');
                // TODO get game by guid
                // game = this._server.getNetworkByHash(event.data);
                if (game) {

                    if (this.join(game)) {
                        this.ok(event);

                    } else {
                        this.error(event, net.Error.AlreadyJoined, event.data);
                    }

                } else {
                    this.error(event, net.Error.NotFound, event.data);
                }

            } else {
                this.invalid(event);
            }


        // Lobby --------------------------------------------------------------
        // --------------------------------------------------------------------
        } else if (state === Client.State.Lobby) {

            if (!this._game) {
                this.error(event, net.Error.NotAvailable);
                this.setState('Server');

            // Leave
            } else if (code === net.Command.Leave) {
                this.leave();

            // Slot Change
            } else if (code === net.Command.Slot) {

                var slotId = event.data;
                if (typeof slotId === 'number' && !isNaN(slotId)) {

                    if (this._game.setSlotClient(slotId, this)) {
                        //this._server.networkInfo(this._game);
                        this.ok(event);

                    } else {
                        this.error(event, net.Error.SlotTaken, slotId);
                    }

                } else {
                    this.invalid(event);
                }

            // Ready
            } else if (code === net.Command.Ready) {

                var isReady = event.data;
                if (typeof isReady === 'boolean') {

                    if (isReady) {
                        //this._game.setReady();
                        this._isReady = true;
                        this.ok(event);

                    } else {

                        if (!this._game.isReady()) {
                            this._isReady = false;
                            this.ok(event);

                        } else {
                            this.error(event, net.Error.NotAvailable);
                        }

                    }

                } else {
                    this.invalid(event);
                }

            } else {
                this.invalid(event);
            }


        // Playing ------------------------------------------------------------
        // --------------------------------------------------------------------
        } else if (state === Client.State.Game) {

            if (code === Client.Command.Action) {

                var player = this.getPlayer();
                if (!player) {
                    this.invalid(event);

                // TODO verify action
                } else if (true) {
                    this.getPlayer().action(event.data);

                } else {
                    this.invalid(event);
                }

            } else {
                this.invalid(event);
            }

        } else {
            this.invalid(event);
        }

    },

    quit: function() {
        this._remote.close();
        //Entity.destroy(this, this);
    },


    // Game Actions -----------------------------------------------------------
    join: function(game) {

        if (game !== this._game) {

            this.leave();

            this._game = game;
            this._game.removeChild(this);
            this.setState('Lobby');
            //this.response('NetworkJoined', game.getHash());

            return true;

        } else {
            return false;
        }

    },

    leave: function() {

        if (this._game) {

            var game = this._game;
            this._game.removeChild(this);
            this._game = null;
            this._player = null;

            this.setState('Server');
            //this.response('NetworkLeft', this._game.getHash());

            return true;

        } else {
            return false;
        }

    },

    setPlaying: function() {
        this.setState('Game');
        //this.send('NetworkStarted', [
            //this._game.getHash(),
            //this.getPlayer().getHash()
        //]);
    },

    send: function(id, code, data) {
        var event = new Event(id, code, data !== undefined ? data : null);
        this._remote.send(event.toArray());
    },

    error: function(event, code, data) {
        utils.assertClass(event, 'Event');
        utils.assert(net.Error.indexOf(code) !== -1, 'error code does exist');
        this.send(event.id, code, data);
    },

    invalid: function(event) {
        utils.assertClass(event, 'Event');
        this.send(event.id, net.Error.Invalid, event.data);
    },


    // Event Handlers ---------------------------------------------------------
    onClose: function() {
        this.log('Quit');
    },

    onEvent: function(event) {
        utils.assertClass(event, 'Event');
        this.log('Event:', event);
        this._events.push(event);
    },


    // Getter / Setter --------------------------------------------------------
    setState: function(state) {
        utils.assertType(state, 'String');
        utils.assert(Client.State.hasOwnProperty(state), '"' + state + '" is a valid state');
        this._state = state;
    },

    getState: function() {
        return this._state;
    },

    setPlayer: function(player) {
        utils.assertClass(player, 'Player');
        this._player = player;
    },

    getPlayer: function() {
        return this._player;
    },

    getName: function() {
        return ''; // TODO add naming
    },

    isPlaying: function() {
        return this._game && this._game.isStarted();
    },

    isReady: function() {
        return this._isReady;
    },

    isSynced: function() {
        return this._synced;
    },

    setSynced: function() {
        this._synced = true;
    },

    // Helpers ----------------------------------------------------------------
    log: function() {
        utils.log.apply(this, arguments);
    },

    toString: function() {
        return 'Client ' + this._remote.id;
    }

});

exports.Client = Client;

