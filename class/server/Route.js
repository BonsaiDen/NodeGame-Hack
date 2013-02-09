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
    Entity = require('./Entity').Entity;

exports.Route = Class(function(node, player, path) {

    this.assert(node.isOfType('Node'), 'node is a Node');
    Entity(this, 'Route', node);

    this.assert(player.isOfType('Player'), 'owner is a Player');
    this.setOwner(player);

    this._nodes = path;

    this.assert(this.isValid(), 'Route is valid');

}, Entity, {

    // Actions ----------------------------------------------------------------
    update: function(tick) {

        if (!this.isValid()) {
            this.destroy(this);
        }

    },

    // Getter / Setter --------------------------------------------------------
    isValid: function() {
        return this._nodes.every(function(node) {
            return node === this.getTarget() || node.isTraversableByPlayer(this.getOwner());

        }, this);
    },

    getSource: function() {
        return this._nodes.first();
    },

    getTarget: function() {
        return this._nodes.last();
    }

    // Helpers ----------------------------------------------------------------


});

