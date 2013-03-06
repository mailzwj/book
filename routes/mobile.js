/*
 * 路由模块 for mobile
 */

var users = require('./user');
var books = require('./book');

exports.mlogin = function(req, res, next){
	//users.login(req, res, next);
	var username = req.param("username") || "乐淘一少";
	var userpass = req.param("userpass");
	var cb = req.param("callback");
	if(cb){
		res.send(cb + "({\"isSuccess\": true, \"userinfo\": {\"nick\": \"" + username + "\", \"email\": \"mailzwj@126.com\", \"isadmin\": 1}});");
	}else{
		res.send("var json={\"isSuccess\": true, \"userinfo\": {\"nick\": \"" + username + "\", \"email\": \"mailzwj@126.com\", \"isadmin\": 1}}");
	}
};

exports.mindex = function(req, res){
	var kw = req.param("keyword") || "";
	var page = req.param("page") || 1;
	var cb = req.param("callback");
	var json = "";
	var pnum = 5;
	books.getbooklist(kw, (page - 1) * pnum, pnum, function(data){
		if(data === "error"){
			json = {"isSuccess": false, "books": {"list": []}};
		}else{
			json = {"isSuccess": true, "books": {"list": data}};
		}
		//console.log(JSON.stringify(json));
		if(cb){
			res.send(cb + "(" + JSON.stringify(json) + ");");
		}else{
			res.send("var json=" + JSON.stringify(json) + ";");
		}
	});
};
