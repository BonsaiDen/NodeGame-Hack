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
    fs = require('fs'),
    Entity = require('./Entity').Entity,
    Player = require('./Player').Player,
    Node = require('./Node').Node,
    Link = require('./Link').Link,
    Action = require('./Action').Action,
    Behavior = require('./Behavior').Behavior;

exports.Network = Class(function() {

    Entity(this, 'Network', null, {
        Link: new List(),
        Node: new List(),
        Player: new List(),
        Client: new List()
    });

    this._neutralPlayer = new Player(this, 0, 'Neutral', true);
    this._observerPlayer = new Player(this, -1, 'Observer', true);
    this._tick = 0;

}, Entity, {

    // Actions ----------------------------------------------------------------
    update: function() {

        //this.log('Update', this._tick);

        var tick = this._tick;
        this.getChildListFor('Client').each(function(client) {
            // TODO expose network in order to have access to players
            client.update(tick);
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


    // Getter / Setter --------------------------------------------------------
    getNeutral: function() {
        return this._neutralPlayer;
    },


    // Helpers ----------------------------------------------------------------
    loadFromFile: function(filename) {
        var json = JSON.parse(fs.readFileSync(filename).toString());
        this.loadFromJson(json);
    },

    loadFromJson: function(map) {

        this.log('Loading Map...');

        var nodes = map.nodes,
            links = map.links;

        utils.each(map.nodes, function(node, i) {
            nodes[i] = new Node(this, this.getNeutral(), node);

        }, this);

        utils.each(map.links, function(link, i) {

            links[i] = new Link(this, nodes[link.from], nodes[link.to]);

            var from = nodes[link.from],
                to = nodes[link.to];

            from.addChild(links[i].getTargetForNode(from));
            to.addChild(links[i].getTargetForNode(to));

        }, this);

        this.log('Map loaded');

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

