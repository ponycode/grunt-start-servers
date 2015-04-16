( function(){
	
	var fs = require('fs');
	var grunt = require('grunt');
	var sys = require('sys');
	var exec = require('child_process').exec;
	
	exports.waitForPIDFile = function( pidFilePath, timeoutSeconds, callback ){
		var startTime = new Date().getTime();
		var interval = setInterval( function(){
			if( fs.existsSync( pidFilePath ) ){
				clearTimeout( interval );

				var readPidCommand = "head -n 1 " + pidFilePath;
				exports.executeCommand( readPidCommand, function( error, PID ){
					callback( error, PID );
				});
			}else{
				var diffMs = new Date().getTime() - startTime;
				if( diffMs > timeoutSeconds*1000 ){
					clearTimeout( interval );
					callback( "Timed out waiting for pid file: " + pidFilePath, false );
				}
				// keep waiting
			}
		}, 500 );
	};

	exports.isPidRunning = function( pid ){
		if( !pid ) return false;
		
		var processIsRunning = true;
		try{
			processIsRunning = process.kill( pid, 0 ); // 0 is a special signal to check if pid exists
		}catch( e ){
			processIsRunning = false;
		}
		
		return processIsRunning;
	};
	
	exports.kill = function( pid ){
		if( !exports.isPidRunning( pid ) ) return;
		
		var killed = false;
		try{
			killed = process.kill( pid, 'SIGINT' );
		}catch( e ){
			killed = false;
		}
		
		return killed;
	};
	
	// WARNING: OSX ONLY -- USES SPOTLIGHT
	exports.findExecutable = function( executableName, callback ){
		var command = "mdfind 'kMDItemContentType == \"public.unix-executable\" &&  kMDItemFSName == \"" + executableName + "\"' | head -n 1";
		exports.executeCommand( command, function( error, executablePath ){
			grunt.log.debug( "Found " + executableName + " at " + executablePath );
			callback( false, executablePath );
		});
	};

	exports.executeCommand = function( command, callback ){
		grunt.log.debug( "Executing command: ", command );

		exec( command, function( error, stdout, stderr ){
			if( error ){
				grunt.log.debug( "Error executing command: ", command );
				if( stderr ) grunt.log.debug( "Standard Error: ", stderr );
				return callback( error, false );
			}
			stdout = (stdout) ? stdout.trim() : stdout;
			callback( false, stdout );
		});
	}
	
})();