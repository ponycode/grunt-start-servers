module.exports = function(grunt) {

	grunt.initConfig({

		servers:{
			mongo:{
				dbPath: "servers/mongo"
			},
			redis:{
				dbPath: "servers/redis"
			}
		}
		
	});

	grunt.loadTasks('tasks');
};