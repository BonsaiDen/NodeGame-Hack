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
    utils = require('../lib/utils').utils;

exports.Action = Class(function(route, behavior) {

    utils.assertClass(route, 'Route');
    utils.assert(route.isValid(), 'route is valid');
    utils.assertClass(behavior, 'Behavior');

    utils.assert(route.getTarget().getNeutralActionsForBehavior(behavior).length === 0,
                'route target has no neutral action with the same behavior');

    this._behavior = behavior;
    this._isPaused = true;
    this._route = route;
    this._node = route.getTarget();
    this._game = this._node.getParent();
    this._isStarted = false;

    Entity(this, 'Action', route.getTarget()); // Node is parent
    this.setOwner(route.getOwner()); // Player is owner

}, Entity, {

    // Actions ----------------------------------------------------------------
    update: function(tick) {

        if (!this._route.isValid() && !this.getBehavior().isCompleted()) {
            this.log('Route became invalid');
            this.pause();

        } else {

            if (!this.isPaused()) {
                this.getBehavior().update(tick);
            }

            if (this.getBehavior().isCompleted()) {
                this.log('Action completed');
                this.getBehavior().execute(this._node);
                this.stop();
            }

        }

    },

    start: function() {
        utils.assert(!this._isStarted, 'action was not yet started');
        this.log('Started');
        this._isPaused = false;
        this._isStarted = true;
    },

    pause: function() {

        // TODO check for any other behaviors of the same type
        // and then discard all but the most progressed one
        utils.assert(!this.isNeutral(), 'action is not owned by neutral');

        this._route = null;
        this._isPaused = true;
        this.setOwner(this._game.getNeutral());
        this.log('Paused');

    },

    resume: function(route) {

        utils.assertClass(route, 'Route');
        utils.assert(this._route === null, 'action has no route');
        utils.assert(this.isNeutral(), 'action is owned by neutral');

        this._isPaused = false;
        this.setOwner(route.getOwner()); // Set to route player
        this.log('Resumed');

    },

    stop: function() {
        utils.assert(!this.isNeutral(), 'action is not owned by neutral');
        this.log('Stopped');
        this.destroy(this);
    },


    // Getter / Setter --------------------------------------------------------
    getBehavior: function() {
        return this._behavior;
    },

    isNeutral: function() {
        return this.isOwnedBy(this._game.getNeutral());
    },


    // Helpers ----------------------------------------------------------------
    toString: function() {
        return Entity.toString(this) + ' (' + this.getBehavior() + ')';
    }

});

