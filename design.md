each Player()
    get input()
        perform actions

Each Node
    update()
        each Action
            update()
                if !route.isValid()
                    route.destroy(this)
                    this.pause()
                
                if this.isDone()
                    this.getBehavior().execute(this)
                    this.stop()

each Link
    update()

each Player()
    update()
