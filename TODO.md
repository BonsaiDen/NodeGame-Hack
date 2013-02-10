## Server

- Client initilization

    - time sync
    - select player
    - other stuff

- State update for players
    
    - traverse visible nodes and collect state for:
        
        - owned nodes (all actions, all features)
            - routes

        - visible nodes (neutral actions, attacks, public features)

    - send the state diffs to the client


## Client

- State handling 

    - general: menu, in game
    - local: menu, map select, in game
    - remote: menu, server game select

- Create events from state diffs




TODO TODO

- time syncing
- map file loading
- move network codes into extra file
- update network lists and network data
