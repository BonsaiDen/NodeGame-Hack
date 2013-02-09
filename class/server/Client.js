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
    Entity = require('./Entity').Entity;

var Client = Class(function(server, remote) {

    this._server = server;
    this._remote = remote;
    this._network = null;
    this._player = null;
    this._state = Client.State.Initializing;
    this._events = new List();

    Entity(this, 'Client');

    this.log('Connected via', remote);

}, Entity, {

    $State: {
        Initializing: 0,
        Syncing: 1,
        Server: 2,
        Lobby: 3,
        Game: 4
    },

    $Action: {

        // Creates a new network and joins it (map)
        // - NetworkInfo follows
        CreateNetwork: 100,

        // Joins an existing network (network)
        // - NetworkInfo follows
        JoinNetwork: 101,

        // Leaves the network the player is in
        // - NetworkList follows
        LeaveNetwork: 102,

        // Changes the player slot for the network (slot)
        // - NetworkInfo follows
        SelectSlot: 103,

        // Changes the player's ready status to true
        // - NetworkInfo follows
        Ready: 104,

        // Changes the player's ready status to false
        // - NetworkInfo follows
        NotReady: 105,

        // A action on the current network
        NetworkAction: 106,

        // Client joined a network (network)
        // - NetworkInfo follows
        // - ClientJoined and ClientLeft may follow
        NetworkJoined: 107,

        // Client left a network (network)
        // - NetworkList follows
        NetworkLeft: 108

    },

    $Error: {

        // An invalid / unkown command was received from the client
        InvalidCommand: 200,

        // The client is not in a network although the action requires one
        NoNetwork: 201,

        // The slot requested is already taken
        SlotTaken: 202,

        // Network to join was not found
        UnknownNetwork: 203,

        // Already in the network requested to join
        SameNetwork: 204,

        // The network is alreay running
        NetworkRunning: 205,

        // The action requested by the client is invalid
        InvalidAction: 206

    },


    // Actions ----------------------------------------------------------------
    update: function() {
        this._events.each(this.updateEvent, this);
        this._events.clear();
    },

    updateEvent: function(event) {

        var network,
            state = this.getState();

        // 1. check connect handshake and send basic server settings like tick rate
        if (state === Client.State.Initializing) {


        // 2. sync time with the server
        } else if (state === Client.State.Syncing) {



        // Server Menu --------------------------------------------------------
        // --------------------------------------------------------------------
        } else if (state === Client.State.Server) {

            // Create
            if (event.type === Client.Action.CreateNetwork) {

                // check map, and stuff or so...
                // TODO create network
                this.join(network);
                this.response('NetworkJoined', network.getHash());

            // Join
            } else if (event.type === Client.Action.JoinNetwork) {

                //utils.assert(network.isOfType('Network'), 'network is a Network');
                network = this._server.getNetworkByHash(event.data);
                if (network) {

                    if (!this.join(network)) {
                        this.error('SameNetwork', event.data);
                    }

                } else {
                    this.error('UnknownNetwork', event.data);
                }

            } else {
                this.error('InvalidCommand', event.type);
            }



        // Lobby --------------------------------------------------------------
        // --------------------------------------------------------------------
        } else if (state === Client.State.Lobby) {

            if (!this._network) {
                this.error('NoNetwork');
                this.setState('Server');

            // Leave
            } else if (event.type === Client.Action.LeaveNetwork) {
                this.leave();

            // Slot Change
            } else if (event.type === Client.Action.SelectSlot) {

                var slotId = event.data;
                if (typeof slotId === 'number' && !isNaN(slotId)) {

                    if (this._network.setPlayerSlot(slotId, this)) {
                        this._server.networkInfo(this._network);

                    } else {
                        this.error('SlotTaken', slotId);
                    }

                } else {
                    this.error('InvalidCommand');
                }

            // Ready
            } else if (event.type === Client.Action.Ready) {
                this._isReady = true;

            // Not Ready
            } else if (event.type === Client.Action.NotReady) {

                if (!this._network.isReady()) {
                    this._isReady = false;

                } else {
                    this.error('NetworkRunning');
                }

            } else {
                this.error('InvalidCommand', event.type);
            }


        // Playing ------------------------------------------------------------
        // --------------------------------------------------------------------
        } else if (state === Client.State.Game) {

            if (event.type === Client.Action.NetworkAction) {

                var player = this.getPlayer();
                if (!player) {
                    this.error(Client.Error.InvalidCommand, event.type);

                // TODO verify action
                } else if (true) {
                    this.getPlayer().action(event.data);

                } else {
                    this.error(Client.Error.InvalidAction, event.data);
                }

            } else {
                this.error(Client.Error.InvalidCommand, event.type);
            }

        } else {
            this.error(Client.Error.InvalidCommand, event.type);
        }

    },

    quit: function() {
        this._remote.close();
        Entity.destroy(this, this);
    },


    // Network Actions --------------------------------------------------------
    join: function(network) {

        if (network !== this._network) {

            this.leave();

            this._network = network;
            this._network.removeChild(this);
            this.setState('Lobby');
            this.response('NetworkJoined', network.getHash());

            return true;

        } else {
            return false;
        }

    },

    leave: function() {

        if (this._network) {

            var network = this._network;
            this._network.removeChild(this);
            this._network = null;
            this._player = null;

            this.setState('Server');
            this.response('NetworkLeft', this._network.getHash());

            return true;

        } else {
            return false;
        }

    },

    setPlaying: function() {
        this.setState('Game');
        this.send('NetworkStarted', [
            this._network.getHash(),
            this.getPlayer().getHash()
        ]);
    },

    send: function(type, data) {
        this._remote.send({
            type: type,
            data: data !== undefined ? data : null
        });
    },

    response: function(type, data) {
        this.assert(typeof type === 'string', 'type is a string');
        this.assert(Client.Action.hasOwnProperty(type), 'response "' + type + '" is a valid action code');
        this.send(type, data);
    },

    error: function(type, data) {
        this.assert(typeof type === 'string', 'type is a string');
        this.assert(Client.Error.hasOwnProperty(type), 'error "' + type + '" is a valid error code');
        this.send(type, data);
    },


    // Event Handlers ---------------------------------------------------------
    onClose: function() {
        this.log('Quit');
    },

    onMessage: function(msg) {
        // TODO for now just echo
        this.log('Message:', msg);
        this.send(msg);
        // parse incoming messages for events
        // push into event queue
    },


    // Getter / Setter --------------------------------------------------------
    setState: function(state) {
        this.assert(typeof state === 'string', 'state is a string');
        this.assert(Client.State.hasOwnProperty(state), '"' + state + '" is a valid state');
        this._state = state;
    },

    getState: function() {
        return this._state;
    },

    setPlayer: function(player) {
        this.assert(player.isOfType('Player'), 'player is a Player');
        this._player = player;
    },

    getPlayer: function() {
        return this._player;
    },

    isPlaying: function() {
        return this._network && this._network.isStarted();
    },

    isReady: function() {
        return this._isReady;
    },


    // Helpers ----------------------------------------------------------------
    toString: function() {
        return Entity.toString(this) + ' ' + this._remote.id;
    }

});

exports.Client = Client;

