( function(){
	
	var path = require('path');
	var utils = require('./utils');
	var fs = require('fs');

	var Mongo = module.exports = function( config ){
		this.config = config;
		this.name = "mongo";
		this.basePath = path.join( process.cwd(), config.dbPath ||  '/servers/mongo' );
		this.pidPath = path.resolve( path.join( this.basePath, 'mongo.pid' ) );
		this.dataPath = path.resolve( path.join( this.basePath, 'data' ) );
		this.logPath = path.resolve( path.join( this.basePath, 'log.txt' ) );
	};

	Mongo.prototype.startCommand = function( callback ){
		var self = this;
		self.isInstalled( function( error, mongodPath ){
			if( !mongodPath ){
				grunt.fail.fatal( new Error( 'mongod not found. Please install mongodb.' ), 1002 );
				return;
			}
			
			if( !fs.existsSync( self.basePath ) ) fs.mkdirSync( self.basePath );

			var command = mongodPath + " --fork --dbpath \"" + self.dataPath + "\" --logpath \"" + self.logPath + "\" --pidfilepath \"" + self.pidPath + "\"";
			callback( error, command );
		});
	};
	
	Mongo.prototype.isInstalled = function( callback ){
		utils.findExecutable( "mongod", callback );
	};
	
})();