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

exports.Client = Class(function(remote) {

    this._state = {};
    this._remote = remote;
    this._events = new List();

    this._state = 'connect';

    Entity(this, 'RemoteClient');

    this.log('Connected via', remote);

}, Entity, {

    // Actions ----------------------------------------------------------------
    update: function(tick) {

        // 1. check connect handshake
        if (this._state === 'init') {

        // 2. sync time and tick
        } else if (this._state === 'sync') {

        // 3. Accept player and other client settings
        } else if (this._state === 'settings') {

            // TODO when done, send intitial player state?

        // 4. Send out state updates from the last tick and parse
        // incoming events for the next one
        } else if (this._state === 'connected') {

            // TODO send out state updates
            // save old state
            // get player state,
            // create diff
            // set state
            // send diff

            // TODO check event queue and confirm / reject them to the remote
            // also, apply them to the player
            this._events.each(function(event) {
                if (this._player.handleEvent(event)) {
                    // TODO send confirm
                } else {
                    // TODO send error
                }
            });

            this._events.clear();

        }

    },

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

    send: function(data) {
        this._remote.send(data);
    },

    quit: function() {
        this._remote.close();
        Entity.destroy(this, this);
    },


    // Getter / Setter --------------------------------------------------------
    //getEvents: function() {

    //},

    //setPlayer: function(player) {

    //},

    //getPlayer: function() {
        //return this._player;
    //},

    //getRemote: function() {
        //return this._remote;
    //},


    // Helpers ----------------------------------------------------------------
    toString: function() {
        return Entity.toString(this) + ' ' + this._remote.id;
    }

});

