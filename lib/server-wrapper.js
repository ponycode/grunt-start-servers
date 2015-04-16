( function(){
	
	var utils = require('./utils');
	var grunt = require('grunt');
	
	var ServerWrapper = module.exports = function( server ){
		this.server = server;
	};

	ServerWrapper.prototype.name = function(){
		return this.server.name;
	};
	
	ServerWrapper.prototype.status = function( timeoutSeconds, callback ){
		var self = this;
		grunt.log.debug( "Getting " + self.server.name + " status: ", self.server.pidPath );
		utils.waitForPIDFile( self.server.pidPath, timeoutSeconds, function( error, pid ){
			callback( error, {
				pid: pid,
				isRunning: utils.isPidRunning( pid ),
				pidPath: self.server.pidPath
			});
		});
	};
	
	ServerWrapper.prototype.start = function( callback ){
		var self = this;

		self.server.startCommand( function( error, command ){
			self.status( 0, function( error, status ){
				if( status.isRunning ){
					grunt.log.warn( self.server.name + " is already running [" + status.pid + "]" );
					callback( false, true );
					return;
				}

				utils.executeCommand( command, function( error, result ){
					if( error ){
						grunt.log.error( "Error starting " + self.server.name, error );
						return callback( false, false );
					}

					self.status( 4, function( error, status ){
						if( status.isRunning ){
							grunt.log.warn( self.server.name + " is now running [" + status.pid + "]" );
							callback( false, true );
						}else{
							grunt.log.error( self.server.name + " did not start: ", error );
							callback( false, false );
						}
					});
				});
			});
		});
	};

	ServerWrapper.prototype.stop = function( callback ){
		var self = this;
		self.status( 0, function( error, status ){
			if( !status.isRunning ){
				grunt.log.warn( self.server.name + " is not running" );
				callback( false, true );
				return;
			}

			var killed = utils.kill( status.pid );
			grunt.log.debug( "Stopped " + self.server.name + " [" + status.pid + "]: ", killed );
			callback( false, killed );
		});
	};
	
})();