#!/usr/bin/env node

require('shelljs/make');
//const strip = require('strip-comments');
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
  (dist).to(scout_js);
  comp = minify(dist);
	comp.src = comp.src + "\n//# sourceMappingURL=scout.min.js.map";
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
			  echo("[" + getDate() +"] success: writing to file");
				result = stdOut[0];
		  } else {
				echo("[" + getDate() +"] exit code: "+exitCode);
				echo(stdErr)
				process.exit(1);
		  }
  });

	return result;
};

getDate = function() {
  var currentDate = new Date();
	var date = currentDate.getDate();
	var month = currentDate.getMonth();
	var year = currentDate.getFullYear();

	return pad(month + 1) + "/" + pad(date) + "/" + year;
};

pad = function(n) {
	 return n<10 ? '0'+n : n;
};
