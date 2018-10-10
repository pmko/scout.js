#!/usr/bin/env node

require('shelljs/make');
strip = require('strip-comments');
uglify = require('uglify-js');

scout_js  = 'dist/scout.js';
scout_min = 'dist/scout.min.js';
scout_map = 'dist/scout.min.js.map;'

target.dist = function() {
  target.build();
	target.minify();
};

target.build = function() {
  modules = (env['MODULES'] || 'scout ajax events').split(' ');
	module_files = [];
  for (var file of modules) { module_files.push(`src/${file}.js`); }
  dist = cat(module_files);
	clean = strip(dist);
	(clean).to(scout_js);
};

target.minify = function() {
  result = minify(scout_js);
	(result.code).to(scout_min);
};

minify = function(source) {
	options = {
		warnings: true
	}
	return uglify.minify(source,options);
};
