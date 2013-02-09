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
    Entity = require('./Entity').Entity,
    Player = require('./Player').Player,
    Node = require('./Node').Node,
    Link = require('./Link').Link,
    Action = require('./Action').Action,
    Behavior = require('./Behavior').Behavior,
    utils = require('../lib/utils').utils,
    fs = require('fs');

exports.Network = Class(function(server) {

    this._isReady = false;
    this._isStarted = false;
    this._isRunning = false;
    this._playerSlots = new List(); // TODO ???
    this._tick = 0;
    this._hash = utils.uniqueHash();

    Entity(this, 'Network', null, {
        Link: new List(),
        Node: new List(),
        Player: new List(),
        Client: new List()
    });

    this._neutralPlayer = new Player(this, 31, 'Neutral', false);
    this._observerPlayer = new Player(this, 32, 'Observer', true);

}, Entity, {

    // Actions ----------------------------------------------------------------
    update: function() {

        if (!this.isRunning()) {
            return;
        }

        //this.log('Update', this._tick);
        var tick = this._tick;
        this.getChildListFor('Client').each(function(client) {
            client.update();
        });

        this.getChildListFor('Node').each(function(node) {
            node.update(tick);
        });

        this.getChildListFor('Link').each(function(link) {
            link.update(tick);
        });

        this.getChildListFor('Player').each(function(player) {
            player.update(tick); // TODO calulate new player state in here
        });

        this._tick++;

    },

    start: function() {

        if (this.isStarted()) {
            return false;

        } else {
            this._isRunning = true;
            this._isStarted = true;
            this.setupClients();
            return true;
        }

    },

    stop: function() {

        if (this.isRunning()) {
            this._isRunning = false;
            this._clients.each(function(client) {
                client.leave();
            });
            return true;

        } else {
            return false;
        }

    },


    // Getter / Setter --------------------------------------------------------
    isStarted: function() {
        return this._isStarted;
    },

    isRunning: function() {
        return this._isRunning;
    },

    isEmpty: function() {
        // TODO check for timeout of the game
        // so players can refresh and re-join if needed
        return this.getChildListFor('Client').length === 0;
    },

    isReady: function() {
        return this._isReady;
    },

    getNeutral: function() {
        return this._neutralPlayer;
    },

    addChild: function(child) {

        Entity.addChild(this, child);

        if (child.isOfType('Client'))  {
            // TODO update info for all clients in netwrk
        }

    },

    removeChild: function(child) {

        Entity.addChild(this, child);

        if (child.isOfType('Client'))  {
            // TODO update info for all clients in netwrk
        }

    },

    getHash: function() {
        return this._hash;
    },


    // Helpers ----------------------------------------------------------------
    setupClients: function() {


        // TODO give player a game hash so the client can je-join
        // in case the

        // Create players for the taken slots and associate them with
        // their clients

        this._playerSlots.each(function(slot) {

            if (slot.client !== null) {
                var player = new Player(this, slot.id, slot.client.getName());
                slot.client.setPlayer(player);
                slot.node.setOwner(player);
            }

        });

        this._clients.each(function(client) {
            if (!client.getPlayer()) {
                client.setPlaying(this._observerPlayer);
            }
            client.setPlaying();
        });

        this._playerSlots.clear();

    },

    loadFromFile: function(filename) {
        var json = JSON.parse(fs.readFileSync(filename).toString());
        this.loadFromJson(json);
    },

    loadFromJson: function(map) {

        this.log('Loading Map...');

        var nodes = map.nodes,
            links = map.links;

        this._playerSlots.clear();
        utils.each(map.nodes, function(node, i) {

            nodes[i] = new Node(this, this.getNeutral(), node);

            // Create slots where players can start at
            if (node.isSlot) {

                this._playerSlots.add({
                    id: this._playerSlots.length,
                    node: node,
                    client: null
                });

            }

        }, this);

        utils.each(map.links, function(link, i) {

            links[i] = new Link(this, nodes[link.from], nodes[link.to]);

            var from = nodes[link.from],
                to = nodes[link.to];

            from.addChild(links[i].getTargetForNode(from));
            to.addChild(links[i].getTargetForNode(to));

        }, this);

        this.log('Map loaded with', this._playerSlots.length, 'slots');

    },

    test: function() {

        var red = new Player(this, 1, 'Red'),
            neutral = this.getNeutral();

        var a = this.getChildById(15),
            b = this.getChildById(20);

        a.setOwner(red);

        this.getChildById(16).setOwner(red);
        this.getChildById(17).setOwner(red);

        this.update(1);
        //console.log(neutral.getVisibleNodes());


        //var nr = b.routeForPlayer(neutral, a);
        //var action = new Action(nr, new Behavior('foo'));

        //var r = a.routeForPlayer(red, a);
        //var action = new Action(r, new Behavior('foo'));
        ////var action = new Action(r, new Behavior('foo'));

        //r.destroy(this);

    }

});

