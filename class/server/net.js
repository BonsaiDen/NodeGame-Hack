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
exports.All = [];

function define(id, map) {

    for(var i in map) {
        if (map.hasOwnProperty(i)) {
            exports.All.push(map[i]);
        }
    }

    exports[id] = map;

}

define('Game', {

    // A list of games with free/total slots (full ones might be joined as observer)
    List: 100,

    // Update for a game (players, slots, ready status)
    Info: 101,

    // Game was started (initial state to follow)
    Started: 102,

    // A Game is finished (status)
    Finished: 103

});

define('Client', {

    // A client joined a game (game, client, slot, observer)
    Joined: 200,

    // A client left a game (game, client, slot, observer)
    Left: 201,

    // Time sync
    Sync: 202

});

define('Command', {

    // Creates a new game and joins it (map)
    // - Game follows
    Create: 300,

    // Joins an existing game (game)
    // - Game follows
    Join: 301,

    // Leaves the game the player is in
    // - Game follows
    Leave: 302,

    // Changes the player slot for the game (slot)
    // - Game follows
    Slot: 303,

    // Changes the player's ready status (boolean)
    // - Game follows
    Ready: 304,

    // Perform a action in the current game
    Action: 305,

    // Login (name)
    Login: 306,

    // Time sync
    Sync: 307

});

define('Error', {

    // The action requested by the client is invalid
    Invalid: 400,

    // A game is already running, the action cannot be performed
    NotAvailable: 401,

    // The slot requested is already taken
    SlotTaken: 402,

    // Player is already in the game requested
    AlreadyJoined: 403,

    // Game requested was not found
    NotFound: 404

});

