/*
 * 用户模块.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");

// 添加
exports.add = function(data, callback){
	coll.insert({"nick": re.nick, "email": re.email, 'work_id': re.work_id, 'isadmin': re.isadmin}, function(err){
		if(err){
			throw err;
		}
		callback();
	});
};

//删除
exports.del = function(data, callback){
	coll.remove({'work_id': data.WorkId}, function (err) {
		if (err) {
			console.log(err);
		}
		callback && callback();
	});
};

// 登录
exports.login = function(req, res, callback){
	var user_info = req.cookies.user_info;
	if (!user_info) {
		// 接入UX平台登录功能，野草在负责
		res.redirect('http://ux.etao.net/api/ucenter/userauth.php?domain=book.etao.net&url=http%3A%2F%2Fbook.etao.net%3A' + res.app.get('port'));
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

//判断用户是否已登录，并返回昵称
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
		if (data.isadmin) {
			callback && callback();
		}
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