
/*
 * GET home page.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var errs = config.errs;
var coll = db.collection("users");
exports.index = function(req, res){
	//var err = req.param("err");
	var data = {title: "我的图书管理系统"};
	/*if(err){
		data.err = errs[err];
	}
	var un = req.param("username");
	var up = req.param("userpass");
	if(up){
		var ch = crypto.createHash("sha1");
		ch.update(up);
		up = ch.digest("hex");
		coll.findOne({"$or": [{nick: un}, {realname: un}, {email: un}], password: up}, function(err, rs){
			if(err){
				console.log("Err:" + err);
			}else{
				if(rs){
					data.user = rs;
					res.render("index", data);
				}else{
					res.redirect("/?err=10002");
				}
			}
		});
	}else{
		res.render("index", data);
	}*/
	res.render("index", data);
};
