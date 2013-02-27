/*
 * about users.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");
// var lang = require('./object-util');
exports.add = function(re, callback){
	console.log(add);
	coll.insert({"nick": re.nick, "email": re.email, 'work_id': re.work_id, 'isadmin': re.isadmin}, function(err){
		if(err){
			throw err;
		}
		callback && callback();
	});
};

//根据userid删除用户
exports.del = function(data, callback){
	coll.remove({'work_id': data.WorkId}, function (err) {
		if (err) {
			console.log(err);
		}
		callback && callback();
	});
};

exports.login = function(req, res, callback){
	var user_info = req.cookies.user_info;
	if (!user_info) {
		res.redirect('http://ux.etao.net/api/ucenter/userauth.php?domain=book.etao.net&url=http%3A%2F%2Fbook.etao.net%3A8080');
	} else {
		var user_info_ob = JSON.parse(decodeURIComponent(user_info)).data;

		user_info_ob = {
			nick: user_info_ob.WangWang,
			email: user_info_ob.Email,
			work_id: user_info_ob.WorkId
		};

		coll.find({'work_id': user_info_ob.WorkId}, function (err, data) {
			if (err) {
				console.log(err);
			}
			// 写入数据库
			if (!data) {
				exports.add(user_info_ob);
			}
			// 写入session
			req.session.user_info_ob = user_info_ob;
			callback && callback();
		});
	}
};

//判断用户是否已登录，并返回相关值
exports.islogin = function(req){
	var nick = "";
	if(req.session){
		nick = req.session.user_info_ob && req.session.user_info_ob.nick;
	}
	return nick;
};

//判断登录用户是否管理员
exports.isadmin = function(req, callback){
	coll.findOne({work_id: req.session.user_info_ob.work_id}, function (err, data) {
		if (err) {
			console.log(err);
		}
		callback && callback(data.isadmin);
	});
};

// 给用户授权管理员权限
exports.grant = function (req, admin_cate, callback) {
	coll.update({work_id: req.session.user_info_ob.work_id}, {$set: {isadmin: admin_cate}}, function (err) {
		if (err) {
			console.log(err);
		}
		callback && callback();
	});
};