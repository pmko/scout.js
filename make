#!/usr/bin/env node

require('shelljs/make');
const strip = require('strip-comments');
const ClosureCompiler = require('google-closure-compiler').jsCompiler;

const scout_js  = 'dist/scout.js';
const scout_min = 'dist/scout.min.js';
const scout_map = 'dist/scout.min.js.map'
var comp = {};

target.dist = function() {
  target.build();
};

target.build = function() {
  modules = (env['MODULES'] || 'scout ajax events').split(' ');
  module_files = [];
  for (var file of modules) { module_files.push(`src/${file}.js`); }
  dist = cat(module_files);
  clean = strip(dist);
  (clean).to(scout_js);
  comp = minify(clean);

	//Need to append sourmap comment

	(comp.src).to(scout_min);
	(comp.sourceMap).to(scout_map);
};

minify = function(source) {
	var result;
  const closureCompiler = new ClosureCompiler({
    compilation_level: 'SIMPLE'
  });

  const compilerProcess = closureCompiler.run([{
    path: 'scout.js',
    src: source,
    sourceMap: null
    }], (exitCode, stdOut, stdErr) => {
			if (!exitCode) {
			  echo("success: writing to file");
				//echo(stdOut[0]);
				result = stdOut[0];
		  } else {
				echo("exit code: "+exitCode);
				echo(stdErr)
		  }
  });

	return result;
};
