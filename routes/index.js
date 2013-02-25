
/*
 * GET home page.
 */
var config = require("../config");
var crypto = require("crypto");
var errs = config.errs;
var users = require('./user');
var books = require('./book');
var http = require('http');

exports.login = function(req, res, next){
	users.login(req, res, next);
};

exports.index = function(req, res){

	var kw = req.param("s");
	var page = req.param("page") ? req.param("page") : 1;
	var list_num = 10;
	if(!kw){
		kw = "";
	}
	var data = {title: "我的图书管理系统", page_url: req.url.replace(/\?.*$/g, ""), kw: kw, err: null, list: [], nick: null};
	if(users.islogin(req)){
		data.nick = users.islogin(req);
	}
	books.getbooklist(kw, (page - 1) * list_num, list_num, function(rs){
		if(rs === "error"){
			data.err = "查询图书列表出错，请尝试刷新页面重试。";
		}else{
			var len = rs.length;
			for(var i = 0; i < len; i++){
				//console.log(rs[i].recommend.length);
				if(rs[i].recommend.length > 120){
					rs[i].recommend = rs[i].recommend.substr(0, 120) + "......";
				}
			}
			data.list = rs;
		}
		res.render("index", data);
	});
	
};
// exports.add = function(req, res){
// 	var unick = "乐淘一少";
// 	var uname = "郑武江";
// 	var upwd = "123456";
// 	var uemail = "mailzwj@126.com";
// 	var md5 = crypto.createHash("md5");
// 	md5.update(upwd);
// 	upwd = md5.digest("hex");
// 	users.add(unick, uname, upwd, uemail, function(){
// 		res.redirect("/");
// 	});
// };

// exports.logout = function(req, res){
// 	req.session.nick = null;
// 	res.redirect(req.param("redirect_url"));
// };
exports.addbook = function(req, res){
	var err = req.param("err");
	var suc = req.param("success");
	var data = {title: "添加图书", page_url: req.url.replace(/\?.*$/g, ""), err: null, success: null, nick: null};
	if(users.islogin(req)){
		data.nick = users.islogin(req);
	}
	if(err){
		data.err = err;
	}
	if(suc){
		data.success = suc;
	}
	res.render("addbook", data);
};
exports.updatebook = function(req, res){
	var err = req.param("err");
	var suc = req.param("success");
	var data = {title: "修改图书信息", page_url: req.url.replace(/\?.*$/g, ""), err: null, success: null, nick: null};
	if(users.islogin(req)){
		data.nick = users.islogin(req);
	}
	if(err){
		data.err = err;
	}
	if(suc){
		data.success = suc;
	}
	res.render("updatebook", data);
};
exports.savebook = function(req, res){
	if(!users.islogin(req)){
		res.redirect("/addbook?err=" + encodeURIComponent("添加图书前，请先登录。"));
	}else{
		var bookname = "jQuery权威指南";
		var book_cate = 1;
		var rc = "本书内容涵盖了Adobe Photoshop认证考试大纲要求的所有知识点，并针对Photoshop初学者的特点，对图层、路径、通道、蒙版、滤镜、文本等重点和难点内容进行了非常透彻的讲解。此外，每章还提供了课后习题，引导读者进行上机" + new Date().getTime();
		var host = req.host;
		var book_number = 0;
		var isbn = "9787111325437";
		books.hasbook(isbn, function(flag){
			if(!flag){
				books.add(bookname, "http://" + host + "/images/pics.png", "肖著强，韩铁男，韩建敏", "中国青年出版社", "2012-12-01", rc, isbn, book_cate, book_number, function(status, info){
					res.redirect("/addbook?" + status + "=" + encodeURIComponent(info));
				});
			}else{
				books.update(bookname, "http://" + host + "/images/pics.png", "肖著强，韩铁男，韩建敏", "中国青年出版社", "2012-12-01", rc, isbn, book_cate, book_number, function(status, info){
					res.redirect("/updatebook?" + status + "=" + encodeURIComponent(info));
				});
			}
		});
	}
}
