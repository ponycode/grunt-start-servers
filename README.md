# grunt-start-servers

Grunt task to start and stop Mongo and Redis on your local workstation. Should be easy to add new types of servers too.

# WARNING: 
This has only been tested on OSX. In fact I know it won't work on windows. It would be nice if someone could help me out on Windows.

### Setup

Add a servers section similar to the following to your gruntfile:
```
grunt.initConfig({

    ... YOUR OTHER CONFIG ...
    
    servers:{
        mongo:{
            dbPath: "servers/mongo"
        },
        redis:{
            dbPath: "servers/redis"
        }
    }
		
});
```

Then you can run commands like:
```

grunt servers:start
grunt servers:status
grunt servers:stop

```

### Future Plans

I plan to add further configuration options for each server type and possible helpers for loading initial data etc.