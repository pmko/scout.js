//     getURLParams.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.getURLParams = function() {
		var params = {};
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(match,key,value,ofset,str){
			params[key] = value;
		});
		return params;
	};
})(Scout);
