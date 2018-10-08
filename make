#!/usr/bin/env node

require('shelljs/make');
fs = require('fs');
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
	(dist).to(scout_js);
};

target.minify = function() {
  min = minify(scout_js);
	(min.code).to(scout_min);
	//(min.map).to(scout_map);
};

minify = function(source) {
	return uglify.minify(source);
};
