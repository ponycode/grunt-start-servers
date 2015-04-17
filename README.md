# grunt-start-servers

Grunt tasks to start and stop mongo and redis

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

# WARNING: This has only been tested on OSX. It would be nice if someone could help me out on Windows.
