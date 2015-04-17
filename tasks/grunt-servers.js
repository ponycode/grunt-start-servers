module.exports = function( grunt ){

	var _ = require( 'lodash' );
	var async = require( 'async' );
	var path = require( 'path' );
	var ServerWrapper = require('../lib/server-wrapper');
	
	function _statusTask( server, config ){
		return function( done ){
			server.lib.status( 0, function( error, status ){
				if( error ) grunt.log.debug( "Error checking " + server.name + " status", error );
				done( false, status );
			});
		};
	}

	function _startTask( server, config ){
		return function( done ){
			server.lib.start( function( error, status ){
				if( error ) grunt.log.debug( "Error starting " + server.name, error );
				done( false, status );
			})
		};
	}
	
	function _stopTask( server, config ){
		return function( done ){
			server.lib.stop( function( error, status ){
				if( error ) grunt.log.debug( "Error stopping " + server.name, error );
				done( false, status );
			})
		};
	}
	
	function _taskForAction( action, server, config ){
		if( action === 'status' ){
			return _statusTask( server, config );
		}else if( action === 'start' ){
			return _startTask( server, config );
		}else if( action === 'stop' ){
			return _stopTask( server, config );
		}
	}
	
	grunt.registerTask( 'servers', 'Display the status of your servers', function( action ){
		if( action == null ) action = 'status';
		
		var done = this.async();
		
		var config = grunt.config.get("servers");
		
		var servers = _.map( config, function( value, key ){
			var Server = require( path.join( '../lib/', key.toLowerCase() ) );

			if( !Server ){
				grunt.fail.fatal( new Error( 'Error loading server lib: ' + key ), 1000 );
				return;
			}
			
			// TODO: validate Server.name, Server.basePath, etc.
			
			//if( !lib[action] ){
			//	grunt.fail.fatal( new Error( 'Error: ' + key + ' lib does not implement action: ' + key + "." + action + "()" ), 1001 );
			//	return;
			//}

			return {
				name: key,
				config: value,
				lib: new ServerWrapper( new Server( config ) )
			};
		});

		var tasks = _.map( servers, function( server ){
			return _taskForAction( action, server, config );
		});

		async.series( tasks, function( error, results ){
			_printResultsForAction( action, results );
			done( error );
		});
	} );
	
	function _printResultsForAction( action, results ){

		grunt.log.debug( "RESULTS", results );
		
		if( action === 'status' ){
			grunt.log.subhead( "Server statuses:" );
		}else if( action === 'start' ){
			grunt.log.subhead( "Starting servers:" );
		}else if( action === 'stop' ){
			grunt.log.subhead( "Stopping servers:" );
		}

		_.each( results, function( result ){
			if( result.isRunning ){
				grunt.log.ok( result.message );
			}else{
				grunt.log.error( result.message );
			}
		});

		grunt.log.writeln();

	}

};