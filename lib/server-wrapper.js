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
		
		var output = {
			server: this.server.name,
			success: true,
			isRunning: false
		};
		
		grunt.log.debug( "Getting " + self.server.name + " status: ", self.server.pidPath );
		
		utils.waitForPIDFile( self.server.pidPath, timeoutSeconds, function( error, pid ){

			grunt.log.debug( "Got pid of " + self.server.name + ": ", pid, error );

			if( utils.isPidRunning( pid ) ){
				grunt.log.debug( self.server.name + " is running: ", pid );
				output.message = self.server.name + " is running [" + pid + "]";
				output.pid = pid;
				output.isRunning = true;
			}else{
				grunt.log.debug( self.server.name + " is not running: ", pid );
				output.message = self.server.name + " is not running";
				output.success = false;
			}
			
			callback( error, output );
		});
	};
	
	ServerWrapper.prototype.start = function( callback ){
		var self = this;

		var output = {
			server: this.server.name,
			success: true
		};
		
		self.server.startCommand( function( error, command ){
			grunt.log.debug( "Starting " + self.server.name + " with command: ", command );

			self.status( 0, function( error, status ){
				grunt.log.debug( "Checked status of " + self.server.name + " before starting: ", status, error );

				if( status.isRunning ){
					output.message = self.server.name + " is already running [" + status.pid + "]";
					callback( false, output );
					return;
				}

				utils.executeCommand( command, function( error, result ){
					grunt.log.debug( "Executed start command: ", result, error );

					if( error ){
						output.message = self.server.name + " failed to start: " + error;
						output.error = error;
						output.success = false;
						return callback( false, output );
					}

					self.status( 4, function( error, status ){
						grunt.log.debug( "Checked status of " + self.server.name + " after starting: ", status, error );

						if( status.isRunning ){
							output.message = self.server.name + " is now running [" + status.pid + "]";
							output.isRunning = true;
							callback( false, output );
						}else{
							output.message = self.server.name + " did not start: " + error;
							output.error = error;
							output.success = false;
							callback( false, output );
						}
					});
				});
			});
		});
	};

	ServerWrapper.prototype.stop = function( callback ){
		var self = this;

		var output = {
			server: this.server.name,
			success: true
		};
		
		self.status( 0, function( error, status ){
			if( !status.success ){
				output.message = self.server.name + " is not running";
				callback( false, output );
				return;
			}

			var killed = utils.kill( status.pid );
			grunt.log.debug( "Issued kill for " + self.server.name + ": ", killed, status.pid );

			if( killed ){
				output.message = self.server.name + " is now stopped [" + status.pid + "]";
			}else{
				output.message = self.server.name + " did not stop [" + status.pid + "]";
				output.success = false;
			}
			
			callback( false, output );
		});
	};
	
})();