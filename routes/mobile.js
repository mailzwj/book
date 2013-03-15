/*
 * 路由模块 for mobile
 */

var users = require('./user');
var books = require('./book');
var http = require("http");
var querystring = require('querystring');

exports.mlogin = function(req, res, next){
	var username = req.body.username,
		password = req.body.password,
		content = querystring.stringify(req.body);

	var creq = http.request({
		// host: 'uxx.etao.net',
		// path: '/test/Idata.php',
		host: 'ued.etao.net',
		path: '/api/ucenter/login/login.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': content.length
		}
	}, function (cres) {
		var d='';
		cres.setEncoding('utf8');
		cres.on('data', function (data) {
			d += data;
		});
		cres.on('end', function () {
			console.log(d);
			getUserInfo(d);
		});
		cres.on('close', function () {
			console.log('ooh closed');
			res.end('login server error');
		});
	});
	creq.write(content);
	creq.end();

	function getUserInfo (d) {
		var d = JSON.parse(d);
		if (!d) {
			return;
		}
		if (d.success == 1) {
			var creq_user_info = http.get({
					host: 'ux.etao.net',
					path: '/api/ucenter/common/user.php?q=' + username
				}, function (cres_user_info) {
					var d_user_info = '';
					cres_user_info.setEncoding('utf8');
					cres_user_info.on('data', function (data) {
						d_user_info  += data;
					});
					cres_user_info.on('end', function () {
						var d_user_info_obj = eval('(' + d_user_info + ')');
						console.log(/*d_user_info, 'end', */d_user_info_obj);
						req.session.user_info_ob = {};
						req.session.user_info_ob.nick = d_user_info_obj.data && d_user_info_obj.data.nicknamecn;
						req.session.user_info_ob.work_id = d_user_info_obj.data && d_user_info_obj.data.staff_id;
						// console.log(req.session.user_info_ob.nick);
						
						users.isadmin(req, function (isadmin) {
							res.send("{\"isSuccess\": true, \"userinfo\": {\"nick\": \"" + req.session.user_info_ob.nick + "\", \"isadmin\": "+ isadmin +"}}");
						});
					});
					cres_user_info.on('close', function () {
						console.log('ooh closed');
						res.end('userinfo server error');
					});
				});
			// creq_user_info.end();
		}
	}

	//users.login(req, res, next);
	//var username = req.param("username") || "乐淘一少";
// 	var username = "乐淘一少";
// 	var userpass = req.param("userpass");
// 	var cb = req.param("callback");
// 	req.session.userinfo = {};
// 	req.session.userinfo.nick = username;
// 	if(cb){
// 		res.send(cb + "({\"isSuccess\": true, \"userinfo\": {\"nick\": \"" + username + "\", \"email\": \"mailzwj@126.com\", \"isadmin\": 1}});");
// 	}else{
// 		res.send("var json={\"isSuccess\": true, \"userinfo\": {\"nick\": \"" + username + "\", \"email\": \"mailzwj@126.com\", \"isadmin\": 1}}");
// 	}
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

exports.scanborrow = function(req, res){
	var isbn = req.param("isbn");
	var nick = req.session.user_info_ob.nick;
	var cb = req.param("callback");
	if(isbn && nick){
		books.canborrow(isbn, function(status){
			if(status){
				books.mborrow(isbn, nick, function(status, info){
					if(status === "err"){
						if(cb){
							res.send(cb + "({\"isSuccess\": false, \"error\": \"" + info + "\"});");
						}else{
							res.send("var json={\"isSuccess\": false, \"error\": \"" + info + "\"};");
						}
					}else if(status === "success"){
						if(cb){
							res.send(cb + "({\"isSuccess\": true, \"bookname\": \"" + info + "\"});");
						}else{
							res.send("var json={\"isSuccess\": true, \"bookname\": \"" + info + "\"};");
						}
					}
				});
			}else{
				if(cb){
					res.send(cb + "({\"isSuccess\": false, \"error\": \"此书不可借或非库存图书。\"});");
				}else{
					res.send("var json={\"isSuccess\": false, \"error\": \"此书不可借非库存图书。\"};");
				}
			}
		});
	}else{
		if(cb){
			res.send(cb + "({\"isSuccess\": false, \"error\": \"借书信息不全。\"});");
		}else{
			res.send("var json={\"isSuccess\": false, \"error\": \"借书信息不全。\"};");
		}
	}
};

exports.mdetail = function(req, res){
	var isbn = req.param("isbn");
	var cb = req.param("callback");
	if(isbn){
		books.getdetail(isbn, function(status, info){
			if(status === "err"){
				if(cb){
					res.send(cb + "({\"isSuccess\": false, \"error\": \"" + info + "\"});");
				}else{
					res.send("var json={\"isSuccess\": false, \"error\": \"" + info + "\"};");
				}
			}else if(status === "success"){
				if(cb){
					res.send(cb + "({\"isSuccess\": true, \"book\": " + JSON.stringify(info) + "});");
				}else{
					res.send("var json={\"isSuccess\": true, \"book\": " + JSON.stringify(info) + "};");
				}
			}
		});
	}else{
		if(cb){
			res.send(cb + "({\"isSuccess\": false, \"error\": \"参数错误。图书信息请求失败。\"});");
		}else{
			res.send("var json={\"isSuccess\": false, \"error\": \"参数错误。图书信息请求失败。\"};");
		}
	}
};

exports.madd = function(req, res){
	var cb = req.param("callback");
	if(req.param("isbn") && req.param("bookcate") && req.param("number")){
		var isbn = req.param("isbn");
		var book_cate = parseInt(req.param("bookcate"));
		var book_number = parseInt(req.param("number"));
		var requ = http.request({
			host: "api.douban.com",
			port: 80,
			path: "/book/subject/isbn/" + isbn + "?alt=json",
			method: "GET"
		}, function(resp){
			var buf = [], size = 0;
			resp.on("data", function(data){
				buf.push(data);
				size += data.length;
			});
			resp.on("end", function(){
				var data = new Buffer(size);
				for(var i = 0, pos = 0; i < buf.length; i++){
					buf[i].copy(data, pos);
					pos += buf[i].length;
				}
				data = data.toString("utf8");
				if(data === "bad isbn"){
					//response.redirect("/addbook?err=" + encodeURIComponent('"' + isbn + '" is a bad isbn.'));
					if(cb){
						res.send(cb + "({\"isSuccess\": false, \"error\": \"ISBN有误。\"});");
					}else{
						res.send("var json={\"isSuccess\": false, \"error\": \"ISBN有误。\"};");
					}
					return false;
				}
				data = JSON.parse(data);
				var bookinfo = data["db:attribute"], bl = bookinfo.length;
				var rc = data["summary"]["$t"];
				var links = data["link"][2]["@href"];
				for(var bi = 0; bi < bl; bi ++){
					bookinfo[bookinfo[bi]["@name"]] = bookinfo[bi]["$t"];
				}
				var bookname = bookinfo["title"];
				books.hasbook(isbn, function(flag){
					if(!flag){
						books.add(bookname, links, bookinfo["author"], bookinfo["publisher"] ? bookinfo["publisher"] : "", bookinfo["pubdate"], rc, isbn, book_cate, 0, book_number, function(status, info){
							//response.redirect("/addbook?" + status + "=" + encodeURIComponent(info));
							if(status === "err"){
								if(cb){
									res.send(cb + "({\"isSuccess\": false, \"error\": \"" + info + "\"});");
								}else{
									res.send("var json={\"isSuccess\": false, \"error\": \"" + info + "\"};");
								}
							}else{
								if(cb){
									res.send(cb + "({\"isSuccess\": true, \"book\": \"" + info + "\"});");
								}else{
									res.send("var json={\"isSuccess\": true, \"book\": \"" + info + "\"};");
								}
							}
						});
					}else{
						/*books.update(bookname, links, bookinfo["author"], bookinfo["publisher"] ? bookinfo["publisher"] : "", bookinfo["pubdate"], rc, isbn, book_cate, 0, book_number, function(status, info){
							response.redirect("/updatebook?" + status + "=" + encodeURIComponent(info));
						});*/
						//response.redirect("/updatebook?err=" + encodeURIComponent("图书已存在<a href='/editbook?isbn=" + isbn + "'>编辑图书</a>"));
						if(cb){
							res.send(cb + "({\"isSuccess\": false, \"error\": \"本书已存在。\"});");
						}else{
							res.send("var json={\"isSuccess\": false, \"error\": \"本书已存在。\"};");
						}
					}
				});
			});
		});
		requ.end();
	}else{
		if(cb){
			res.send(cb + "({\"isSuccess\": false, \"error\": \"添加失败，图书信息不足。\"});");
		}else{
			res.send("var json={\"isSuccess\": false, \"error\": \"添加失败，图书信息不足。\"};");
		}
	}
};

exports.mreturn = function(req, res){
	var nick = "";
	var cb = req.param("callback");
	if(req.session.user_info_ob && req.session.user_info_ob.nick){
		nick = req.session.user_info_ob.nick;
	}else{
		if(cb){
			res.send(cb + "({\"isSuccess\": false, \"error\": \"非法操作。\"});");
		}else{
			res.send("var json={\"isSuccess\": false, \"error\": \"非法操作。\"};");
		}
	}
	var isbn = req.param("isbn");
	if(nick && isbn){
		books.ls.findOne({username: nick, isbn: isbn}, function(err, rs){
			if(err){
				if(cb){
					res.send(cb + "({\"isSuccess\": false, \"error\": \"系统错误。\"});");
				}else{
					res.send("var json={\"isSuccess\": false, \"error\": \"系统错误。\"};");
				}
			}else{
				if(rs){
					books.checkreturn(rs._id, isbn, function(status, info){
						if(status === "err"){
							if(cb){
								res.send(cb + "({\"isSuccess\": false, \"error\": \"" + info + "\"});");
							}else{
								res.send("var json={\"isSuccess\": false, \"error\": \"" + info + "\"};");
							}
						}else{
							if(cb){
								res.send(cb + "({\"isSuccess\": true, \"book\": \"" + info + "\"});");
							}else{
								res.send("var json={\"isSuccess\": true, \"book\": \"" + info + "\"};");
							}
						}
					});
				}else{
					if(cb){
						res.send(cb + "({\"isSuccess\": false, \"error\": \"未找到借书记录。\"});");
					}else{
						res.send("var json={\"isSuccess\": false, \"error\": \"未找到借书记录。\"};");
					}
				}
			}
		});
	}else{
		if(cb){
			res.send(cb + "({\"isSuccess\": false, \"error\": \"参数错误。\"});");
		}else{
			res.send("var json={\"isSuccess\": false, \"error\": \"参数错误。\"};");
		}
	}
};
