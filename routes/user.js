/*
 * about users.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");
exports.add = function(nick, username, pwd, email, callback){
	//add user
	coll.insert({"nick": nick, "realname": username, "password": pwd, "email": email}, function(err){
		if(err){
			throw err;
		}
		callback();
	});
};

exports.login = function(uid, pwd, rurl, req, res){
	if(uid && pwd){
		coll.findOne({"$or": [{"nick": uid}, {"realname": uid}, {"email": uid}], "password": pwd}, function(err, rs){
			if(err){
				throw err;
			}
			if(rs){
				req.session.nick = rs.nick;
				res.redirect(rurl);
			}else{
				res.render("login", {title: "登录>>我的图书管理系统", page_url: rurl, err: "请检查用户名或密码是否正确。", redirect_url: "/"});
			}
		});
	}else{
		res.redirect(rurl);
	}
};

//只允许修改密码和邮箱
exports.update = function(pwd, email){
	//update user
};

//根据userid删除用户
exports.del = function(uid){
	//delete user
};

//判断用户是否已登录，并返回相关值
exports.islogin = function(req){
	//check login
	var usession = "";
	if(req.session){
		usession = req.session.nick;
	}
	if(usession){
		return usession;
	}else{
		return false;
	}
};

//判断登录用户是否管理员，并返回bool值
exports.isadmin = function(uid){
	//check level
};