//     renderTemplate.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.renderTemplate = function(template, data) {
		for (var prop in data) {
			var regex = new RegExp('(\\$\\{'+prop+'\\})', 'g');
			//my not need this test
			if (regex.test(template)) {
				template = template.replace(regex,function(){
					return data[prop];
				});
			}
		}
		return template;
	};
})(Scout);
