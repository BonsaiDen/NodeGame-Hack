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
    List = require('../../lib/List').List,
    utils = require('../../lib/utils').utils,
    Entity = require('./Entity').Entity;

exports.Player = Class(function(game, color, name, isPassive) {

    this._color = color;
    this._name = name;
    this._isPassive = isPassive;
    this._hash = utils.uniqueHash();

    Entity(this, 'Player', game, {
        Node: new List()
    });

}, Entity, {

    action: function(action) {

    },

    update: function(tick) {

        var visible = this.getVisibleNodes();
        // Get actions, features(?) and other things to serialize

    },


    // Actions ----------------------------------------------------------------
    //launchAction: function(sourceNode, targetNode, actionBehavior) {

    //},

    //cancelAction: function(targetNode) {

    //},


    // Getter / Setter --------------------------------------------------------
    isFriendOf: function(other) {
        utils.assertClass(other, 'Player');
        return other === this || other === this.getParent().getNeutral();
    },

    getVisibleNodes: function() {

        // All Nodes which are either neutral, or connected to a
        // neutral / player owned Node.
        //
        // As a result, Players can see the borderline Nodes of other
        // players and the whole network of neutral nodes
        var visible = new List();
        var nodes = this.getChildListFor('Node').items();
        while(nodes.length) {

            var node = nodes.shift();
            if (node.isTraversableByPlayer(this)) {

                visible.add(node);
                node.getLinkedNodes().each(function(linked) {

                    if (!visible.has(linked)) {
                        nodes.push(linked);
                    }

                });

            }

        }

        return visible;

    },

    getHash: function() {
        return this._hash;
    },


    // Helpers ----------------------------------------------------------------
    toString: function() {
        return Entity.toString(this) + ' C:' + this._color + ' N:' + this._name;
    }

});

