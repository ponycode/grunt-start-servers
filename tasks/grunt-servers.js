module.exports = function( grunt ){

	var _ = require( 'lodash' );
	var async = require( 'async' );
	var path = require( 'path' );
	var ServerWrapper = require('../lib/server-wrapper');
	
	function _statusTask( server, config ){
		return function( done ){
			server.lib.status( 0, function( error, status ){
				grunt.log.subhead( server.name + " status:" );
				if( status.isRunning ){
					grunt.log.ok( "running [" + status.pid + "]" );
				}else{
					grunt.log.error( "not running" );
				}
				grunt.log.writeln();
				done();
			});
		};
	}

	function _startTask( server, config ){
		return function( done ){
			server.lib.start( function( error, started ){
				grunt.log.subhead( "Started " + server.name );
				done();
			})
		};
	}
	
	function _stopTask( server, config ){
		return function( done ){
			server.lib.stop( function( error, stopped ){
				grunt.log.subhead( "Stopped " + server.name );
				done();
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
			done( error );
		});
	} );

};