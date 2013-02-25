
/*
 * GET home page.
 */
var config = require("../config");
var crypto = require("crypto");
var errs = config.errs;
var users = require('./user');
var books = require('./book');
var http = require("http");

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
	/*var uid = "乐淘一少";
	var upwd = "123456";
	var r_url = req.param("redirect_url");
	var md5 = crypto.createHash("md5");
	md5.update(upwd);
	upwd = md5.digest("hex");
	users.login(uid, upwd, r_url, req, res);*/
	var r_url = req.param("redirect_url");
	var err = req.param("err");
	var uid = req.param("uid");
	var pwd = req.param("pwd");
	var data = {title: "登录>>我的图书管理系统", page_url: req.url, redirect_url: "/", err: null, nick: null};
	if(!r_url){
		r_url = "/";
	}
	data.redirect_url = r_url;
	if(users.islogin(req)){
		data.nick = users.islogin(req);
	}
	if(!(uid && pwd)){
		res.render("login", data);
	}else{
		var md5 = crypto.createHash("md5");
		md5.update(pwd);
		pwd = md5.digest("hex");
		users.login(uid, pwd, r_url, req, res);
	}
};
exports.logout = function(req, res){
	req.session.nick = null;
	res.redirect(req.param("redirect_url"));
};
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
	var response = res, request = req;
	if(!users.islogin(req)){
		res.redirect("/addbook?err=" + encodeURIComponent("添加图书前，请先登录。"));
	}else{
		if(req.param("isbn") && req.param("bc")){
			var isbn = req.param("isbn");
			var book_cate = req.param("bc");
			var req = http.request({
				host: "api.douban.com",
				port: 80,
				path: "/book/subject/isbn/" + isbn + "?alt=json",
				method: "GET"
			}, function(res){
				var buf = [], size = 0;
				res.on("data", function(data){
					buf.push(data);
					size += data.length;
				});
				res.on("end", function(){
					var data = new Buffer(size);
					for(var i = 0, pos = 0; i < buf.length; i++){
						buf[i].copy(data, pos);
						pos += buf[i].length;
					}
					//console.log(data.toString("utf8"));
					data = data.toString("utf8");
					data = JSON.parse(data);
					console.log(data);
					var bookinfo = data["db:attribute"], bl = bookinfo.length;
					var rc = data["summary"]["$t"];
					var links = data["link"][2]["@href"];
					for(var bi = 0; bi < bl; bi ++){
						bookinfo[bookinfo[bi]["@name"]] = bookinfo[bi]["$t"];
					}
					var bookname = bookinfo["title"];
					var book_number = 1;
					books.hasbook(isbn, function(flag){
						if(!flag){
							books.add(bookname, links, bookinfo["author"], bookinfo["publisher"] ? bookinfo["publisher"] : "", bookinfo["pubdate"], rc, isbn, book_cate, book_number, function(status, info){
								response.redirect("/addbook?" + status + "=" + encodeURIComponent(info));
							});
						}else{
							books.update(bookname, links, bookinfo["author"], bookinfo["publisher"] ? bookinfo["publisher"] : "", bookinfo["pubdate"], rc, isbn, book_cate, book_number, function(status, info){
								response.redirect("/updatebook?" + status + "=" + encodeURIComponent(info));
							});
						}
					});
				});
			});
			req.end();
		}else{
			res.redirect("/addbook?err=" + encodeURIComponent("请输入ISBN编码。"));
		}
	}
}
