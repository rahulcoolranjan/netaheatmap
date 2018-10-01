'use strict'
var fetch=require("./fetch");
var url_ext_link="http://localhost:1234/main/venturepart/state_file1.php";
var url_fetch=function(url, options, callback) {
	if (!callback && typeof options === 'function') {
        callback = options;
        options = undefined;
    }
    options = options || {};
	var urls=url_ext_link+"?url=https://neta-app.com/states/"+url+"/map";
	console.log("URL Fetching "+urls);
	fetch.fetchUrl(urls, options,(error, meta, body) => {
		if (error) {
			return console.log('ERROR', error.message || error);
		}
		return callback(null,body);
	});
	
}
exports.url_fetch=url_fetch;