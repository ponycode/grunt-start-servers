( function(){

	var path = require('path');
	var utils = require('./utils');
	var fs = require('fs');

	var Mongo = module.exports = function( config ){
		this.config = config;
		this.name = "redis";
		this.basePath = path.join( process.cwd(), config.dbPath ||  '/servers/redis' );
		this.pidPath = path.resolve( path.join( this.basePath, 'redis.pid' ) );
		this.dataPath = path.resolve( path.join( this.basePath, 'data' ) );
		this.logPath = path.resolve( path.join( this.basePath, 'log.txt' ) );
	};

	Mongo.prototype.startCommand = function( callback ){
		var self = this;
		self.isInstalled( function( error, redisServerPath ){
			if( !redisServerPath ){
				grunt.fail.fatal( new Error( 'redis-server not found. Please install redis-server.' ), 1002 );
				return;
			}

			if( !fs.existsSync( self.basePath ) ) fs.mkdirSync( self.basePath );
			if( !fs.existsSync( self.dataPath ) ) fs.mkdirSync( self.dataPath );
			if( !fs.existsSync( self.logPath ) ) fs.closeSync( fs.openSync( self.logPath, 'w') );

			var command = redisServerPath + " --daemonize yes --pidfile " + self.pidPath + " --logfile " + self.logPath + " --dir " + self.dataPath;
			callback( error, command );
		});
	};

	Mongo.prototype.isInstalled = function( callback ){
		utils.findExecutable( "redis-server", callback );
	};

})();