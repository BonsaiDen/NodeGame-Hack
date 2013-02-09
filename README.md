NodeGame: Hack
--------------

This will eventually become a game where players take control of "Nodes" in a 
Network and attack other players while taking over their nodes by hacking through 
firewalls, deploying viruses using backtraces to hijack an attacker and other things.

Any action performed will need a route to be established across the network of 
nodes, the longer the route, the slower the action is executed.

Nodes are connected by "Links" which can be overloaded by opening many connections 
which route through them, allowing players do essentially (D)DoS other players for 
both offensive and defensive purposes.


## Architecture

As the game will feature both Singleplayer and Multiplayer modes, the game is 
completely design with the client / server model in mind.

In single player mode, a local server runs right in the users browser. 

Communication between the game client and the server is either done via WebSockets 
or a in-browser abstraction which transparently routes the requests to the browser 
based server when in single player.


## Development Progress

At the moment, the server system already works, so you can either run a local one 
or a remote one and connect to it.

Parts of the basic game features are also implemented, right now I'm working on 
the interaction part between the game client and the remote player object's on the 
server so one can log into the game and issue generic commands.

Afterwards, the game logic and UI will be developed in sync until the game will 
hopefully get finished!

