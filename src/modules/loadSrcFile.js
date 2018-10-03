//     loadSrcFile.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.loadSrcFile = function(file,complete) {
		var el;

		function handleComplete(evt) {
			evt.target.removeEventListener("load",handleComplete);
			if (typeof complete === "function") complete();
		}

		if (/.css/.test(file)) {
			el = document.createElement('link');
			el.setAttribute("rel", "stylesheet");
  			el.setAttribute("type", "text/css");
  			document.getElementsByTagName('head')[0].appendChild(el);
  			el.addEventListener("load",handleComplete,true);
  			el.setAttribute("href", file);
		} else if (/.js/.test(file)) {
			el = document.createElement('script');
			el.setAttribute("type","text/javascript");
			document.getElementsByTagName("head")[0].appendChild(el);
			el.addEventListener("load",handleComplete,true);
  			el.setAttribute("src", file);
		}
	};
})(Scout);
