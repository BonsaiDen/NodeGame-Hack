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
    Route = require('./Route').Route;

exports.Node = Class(function(network, player, data) {

    Entity(this, 'Node', network, {
        Node: new List(),
        Action: new List(),
        Route: new List(1)
    });

    this._data = data;
    this.setOwner(player);

}, Entity, {

    // Actions ----------------------------------------------------------------
    update: function(tick) {

        this.getChildListFor('Action').each(function(action) {
            action.update(tick);
        });

        this.getChildListFor('Route').each(function(route) {
            route.update(tick);
        });

    },

    routeForPlayer: function(player, target) {

        this.assert(target.isOfType('Node'), 'target is Node');
        this.assert(player.isOfType('Player'), 'player is Player');
        this.assert(this.isOwnedBy(player), 'player is owner of this node');

        var maxDist = 100000000,
            distance = {},
            previous = {};

        function distanceTo(node) {

            if (distance.hasOwnProperty(node.getId())) {
                return distance[node.getId()];

            } else {
                return maxDist;
            }

        }

        // Create a copy of the connected nodes list
        var nodes = this.getLinkedNodes().items();
        nodes.push(this);

        distance[this.getId()] = 0;

        // Perform a Djikstra search across the nodes
        while(nodes.length) {

            // Find nearest node
            var minDistance = maxDist,
                nearestNode = null,
                nearestIndex = -1;

            for(var i = 0, l = nodes.length; i < l; i++) {

                var n = nodes[i];
                if (distanceTo(n) < minDistance) {
                    minDistance = distanceTo(n);
                    nearestNode = n;
                    nearestIndex = i;
                }

            }

            // No path exists
            if (!nearestNode || distanceTo(nearestNode) === maxDist) {
                break;
            }

            // Remove nearest node
            nodes.splice(nearestIndex, 1);

            // Did we reach the target?
            if (nearestNode === target) {

                var path = new List();
                while (nearestNode) {
                    path.add(nearestNode);
                    nearestNode = previous[nearestNode.getId()];
                }

                path.reverse();

                return new Route(this, this.getOwner(), path);

            }

            // Check linked nodes and calculate their distances
            nearestNode.getLinkedNodes().each(function(node) {

                // Only allow passing through friendly nodes (and the into target)
                if (node === target || node.isTraversableByPlayer(player)) {

                    var dist = distanceTo(nearestNode) + nearestNode.getDistanceToNode(node);
                    if (dist < distanceTo(node)) {
                        distance[node.getId()] = dist;
                        previous[node.getId()] = nearestNode;
                        nodes.push(node);
                    }

                }

            }, this);

        }

        return null;

    },


    // Getter / Setter --------------------------------------------------------
    setOwner: function(player) {

        var oldOwner = this.getOwner();
        Entity.setOwner(this, player);

        oldOwner && oldOwner.removeChild(this);
        this.getOwner().addChild(this);

    },

    getLinkedNodes: function() {
        return this.getChildListFor('Node');
    },

    getDistanceToNode: function(other) {

        this.assert(other.isOfType('Node'), 'other is a Node');

        var a = this.getPosition(),
            b = other.getPosition(),
            dx = a.x - b.x,
            dy = a.y - b.y;

        return Math.sqrt(dx * dx + dy * dy);

    },

    getPosition: function() {
        return {
            x: +this._data.x,
            y: +this._data.y
        };
    },

    getActionsForBehavior: function(behavior) {
        return this.getChildListFor('Action').filter(function(action) {
            return action.getBehavior().equals(action.getBehavior());
        });
    },

    getNeutralActionsForBehavior: function(behavior) {
        return this.getActionsForBehavior('Action').filter(function(action) {
            return action.isNeutral();

        }, this);
    },

    isTraversableByPlayer: function(player) {
        this.assert(player.isOfType('Player'), 'player is a Player');
        return player.isFriendOf(this.getOwner());
        //return this.getOwner().isFriendOf(player); // TODO why doesn' this work?
    },

    isSpawn: function() {
        return !!this._data.spawn;
    },

    hasActiveRoute: function() {
        return this._route.length > 0;
    }


    // Helpers ----------------------------------------------------------------

});

