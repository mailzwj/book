/*
 * about users.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");
exports.add = function(username, pwd, email){
	//add user
};

//只允许修改密码和邮箱
exports.update = function(pwd, email){
	//update user
};

//根据userid删除用户
exports.del = function(uid){
	//delete user
};

//判断用户是否已登录，并返回bool值
exports.islogin = function(uid){
	//check login
};

//判断登录用户是否管理员，并返回bool值
exports.isadmin = function(uid){
	//check level
};