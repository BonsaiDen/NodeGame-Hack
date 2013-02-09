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
    utils = require('../lib/utils').utils;

exports.Entity = Class(function(type, parent, childTypes) {

    this._entityId = ++exports.Entity.id;
    this._entityType = type;
    this._entityOwner = null;

    this._childTypes = childTypes || null;

    this._entityParent = parent;
    this.getParent() && this.getParent().addChild(this);

}, {

    $id: 0,


    // Actions ----------------------------------------------------------------
    update: function(tick) {
        throw new Error('update() not implemented for ' + this.getType());
    },

    addChild: function(child) {

        this.assert(child, 'child is not null/undefined');
        this.assert(this._childTypes !== null, 'child types are set');
        this.assert(child !== this, 'child cannot be its own child');

        var types = this._childTypes;
        for(var type in types) {
            if (types.hasOwnProperty(type) && child.isOfType(type)) {
                this.assert(types[type].add(child), type + ' was added');
                this.log('Added child', child);
                return;
            }
        }

        throw new Error(this.getType() + '.addChild() not implemented for ' + child.getType());

    },

    removeChild: function(child) {

        this.assert(child, 'child is not null/undefined');
        this.assert(this._childTypes !== null, 'child types are set');
        this.assert(child !== this, 'child cannot be its own child');

        var types = this._childTypes;
        for(var type in types) {
            if (types.hasOwnProperty(type) && child.isOfType(type)) {
                this.assert(types[type].remove(child), type + ' was removed');
                this.log('Removed child', child);
                return true;
            }
        }

        throw new Error(this.getType() + '.removeChild() not implemented for ' + child.getType());

    },

    destroy: function(caller) {

        this.assert(typeof caller === 'object', 'Caller of destroy is a object');

        this.getParent() && this.getParent().removeChild(this);

        this.log('Was destroyed by', caller);

        for(var i in this) {
            if (this.hasOwnProperty(i)) {
                this[i] = null;
            }
        }

    },


    // Getter / Setter --------------------------------------------------------
    getId: function() {
        return this._entityId;
    },

    getType: function() {
        return this._entityType;
    },

    getParent: function() {
        return this._entityParent;
    },

    getChildListFor: function(type) {

        this.assert(typeof type === 'string' && type !== '', 'type is a string');
        this.assert(this._childTypes !== null, 'child types are set');

        return this._childTypes[type];

    },

    getChildById: function(id) {

        this.assert(typeof id === 'number' && !isNaN(id), 'id is a number');
        this.assert(this._childTypes !== null, 'child types are set');

        var types = this._childTypes;
        for(var type in types) {
            if (types.hasOwnProperty(type) && types[type].has(id)) {
                return types[type].get(id);
            }
        }

    },

    setOwner: function(player) {
        this.assert(player.isOfType('Player'), 'player is a Player');
        this._entityOwner = player;
        this.log('Is now owned by', player);
    },

    getOwner: function() {
        return this._entityOwner;
    },

    isOwnedBy: function(player) {
        this.assert(player.isOfType('Player'), 'player is a Player');
        return this._entityOwner === player;
    },

    isOfType: function(type) {
        return this.getType() === type;
    },


    // Helpers ----------------------------------------------------------------
    log: function() {
        utils.log.apply(this, arguments);
    },

    assert: function(assertion, msg) {
        utils.assert(assertion, msg);
    },

    toString: function() {
        return this.getType() + ' #' + this.getId();
    }

});

