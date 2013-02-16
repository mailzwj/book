
/*
 * GET home page.
 */

var config = require("../config");
var crypto = require("crypto");
var errs = config.errs;
var users = require('./user');
var books = require('./book');
exports.index = function(req, res){
	//var err = req.param("err");
	var data = {title: "我的图书管理系统", page_url: req.url};
	if(users.islogin(req)){
		data.nick = users.islogin(req);
	}
	res.render("index", data);
};

exports.add = function(req, res){
	var unick = "乐淘一少";
	var uname = "郑武江";
	var upwd = "123456";
	var uemail = "mailzwj@126.com";
	var md5 = crypto.createHash("md5");
	md5.update(upwd);
	upwd = md5.digest("hex");
	users.add(unick, uname, upwd, uemail, function(){
		res.redirect("/");
	});
};

exports.login = function(req, res){
	var uid = "乐淘一少";
	var upwd = "123456";
	var r_url = req.param("redirect_url");
	var md5 = crypto.createHash("md5");
	md5.update(upwd);
	upwd = md5.digest("hex");
	users.login(uid, upwd, r_url, req, res);
};

exports.logout = function(req, res){
	req.session.nick = null;
	res.redirect(req.param("redirect_url"));
};
