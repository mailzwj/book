/*
 * about books.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");
var bcol = db.collection("books");
var ls = db.collection("lendhistory");
exports.add = function(bookname, pic, author, publish_house, publish_date, recommend, isbn, book_cate, book_number, callback){
	//add book
	if(bookname && book_cate && isbn){
		var pic = pic ? pic : "",
			author = author ? author : "",
			publish_house = publish_house ? publish_house : "",
			publish_date = publish_date ? publish_date : "",
			recomend = recomend ? recomend : "暂无推荐信息",
			book_number = book_number >= 0 ? book_number : 0;
		bcol.insert({bookname: bookname, pic: pic, author: author, publish_house: publish_house, publish_date: publish_date, borrow_times: 0, score: 0, isbn: isbn, recommend: recommend, book_cate: book_cate, book_number: book_number}, function(err){
			if(err){
				//throw err;
				//res.redirect("/addbook?err=图书信息保存失败，请重新添加。");
				callback("err", "图书信息保存失败，请重新添加。");
			}else{
				//res.redirect("/addbook?success=保存成功。");
				callback("success", "保存成功。");
			}
		});
	}else{
		//res.redirect("/addbook?err=图书信息不完整。");
		callback("err", "图书信息不完整。");
	}
};

exports.hasbook = function(isbn, callback){
	bcol.findOne({isbn: isbn}, function(err, obj){
		if(err){
			//callback(false);
			throw err;
		}else{
			if(obj){
				callback(true);
			}else{
				callback(false);
			}
		}
	});
};

//获取图书列表
exports.getbooklist = function(kw, start, len, callback){
	bcol.find({"bookname": new RegExp(kw, "gi")}, {"limit": len, "skip": start, sort: [["publish_date", "desc"]]}).toArray(function(err, rs){
		if(err){
			callback("error");
		}else{
			callback(rs);
		}
	});
};

//修改书籍信息
exports.update = function(bookname, pic, author, publish_house, publish_date, recommend, isbn, book_cate, book_number, callback){
	//update book
	if(bookname && book_cate && isbn){
		var pic = pic ? pic : "",
			author = author ? author : "",
			publish_house = publish_house ? publish_house : "",
			publish_date = publish_date ? publish_date : "",
			recomend = recomend ? recomend : "暂无推荐信息",
			book_number = book_number >= 0 ? book_number : 0;
		bcol.update({isbn: isbn}, {"$set": {bookname: bookname, pic: pic, author: author, publish_house: publish_house, publish_date: publish_date, borrow_times: 0, score: 0, recommend: recommend, book_cate: book_cate, book_number: book_number}}, function(err){
			if(err){
				//throw err;
				//res.redirect("/addbook?err=图书信息保存失败，请重新添加。");
				callback("err", "图书信息修改失败，请重新保存。");
			}else{
				//res.redirect("/addbook?success=保存成功。");
				callback("success", "图书信息修改成功。");
			}
		});
	}else{
		//res.redirect("/addbook?err=图书信息不完整。");
		callback("err", "图书信息不完整。");
	}
};

//根据bookid删除书籍
exports.del = function(isbn, callback){
	//delete book
	bcol.delete({isbn: isbn}, function(err){
		if(err){
			callback("err", "删除失败了，请重试！");
		}else{
			callback("success", "删除成功！");
		}
	});
};

//判断图书可借状态，返回bool
exports.canborrow = function(isbn, callback){
	//是否可借
	bcol.findOne({isbn: isbn}, function(err, book){
		if(err){
			//throw err;
			callback(false);
		}else{
			if(book && book.book_number > 0){
				callback(true);
			}else{
				callback(false);
			}
		}
	});
};

exports.pushborrow = function(username, isbn, callback){
	//将申请放入借书申请列表
	bcol.findOne({isbn: isbn, book_number: {"$gt": 0}}, function(err, book){
		if(err){
			callback("err", "未知错误。");
		}else{
			if(book){
				bcol.update({isbn: isbn}, {"$inc": {book_number: -1}}, function(err){
					if(err){
						callback("err", "借书申请发送失败，请重新尝试。");
					}else{
						var date = new Date();
						ls.insert({username: username, isbn: isbn, bookname: book.bookname, borrow_time: date, return_time: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), status: 1,book_cate: book.book_cate}, function(err){
							if(err){
								callback("err", "借书申请发送失败，请重新尝试。");
							}else{
								callback("success", "申请成功，请至管理员处领取书籍。");
							}
						});
					}
				});
			}else{
				callback("err", "未找到与此isbn号对应的图书。");
			}
		}
	});
};

exports.getborrowlist = function(cate, callback){
	ls.find({book_cate: cate.toString(), status: 1}, {sort: [["borrow_time", "desc"]]}).toArray(function(err, rs){
		if(err){
			callback("err", "查询列表失败。");
		}else{
			if(rs){
				callback("success", rs);
			}else{
				callback("err", "未找到相关记录。");
			}
		}
	});
};

exports.checkborrow = function(flag, username, isbn, callback){
	//通过或拒绝的借书申请，修改借阅历史表中对应记录状态标识
	if(flag === "pass"){
		ls.update({username: username, isbn: isbn, status: 1}, {"$set": {status: 2}}, function(err){
			if(err){
				callback("err", "用户" + username + "的借阅申请审核失败。");
			}else{
				callback("success", "审核通过。");
			}
		});
	}else if(flag === "cancel"){
		ls.update({username: username, isbn: isbn, status: 1}, {"$set": {status: 4}}, function(err){
			if(err){
				callback("err", "拒绝" + username + "的借阅申请审核失败。");
			}else{
				bcol.update({isbn: isbn}, {"$inc": {book_number: 1}}, function(err){
					if(err){
						callback("err", "拒绝" + username + "的借阅申请审核失败。");
					}else{
						callback("success", "拒绝成功。");
					}
				});
			}
		});
	}
};

exports.pushreturn = function(username, isbn, callback){
	//修改借阅历史表的还书申请状态
	ls.update({username: username, isbn: isbn, status: 2}, {"$set": {status: 3}}, function(err){
		if(err){
			callback("err", "还书申请发送失败，请重新发送。");
		}else{
			callback("success", "还书申请发送成功，请到管理员处还书。");
		}
	});
};

exports.checkreturn = function(flag, username, isbn, callback){
	//通过或拒绝的还书申请，修改借阅历史表中对应记录状态标识
	if(flag === "pass"){
		ls.update({username: username, isbn: isbn, status: 3}, {"$set": {status: 4}}, function(err){
			if(err){
				callback("err", "用户" + username + "的还书申请审核失败。");
			}else{
				bcol.update({isbn: isbn}, {"$inc": {book_number: 1}}, function(err){
					if(err){
						callback("err", "用户" + username + "的还书申请审核失败。");
					}else{
						callback("err", "还书成功。");
					}
				});
			}
		});
	}else if(flag === "cancel"){
		ls.update({username: username, isbn: isbn, status: 3}, {"$set": {status: 2}}, function(err){
			if(err){
				callback("err", "取消" + username + "的还书申请失败。");
			}else{
				callback("success", "取消申请成功。");
			}
		});
	}
};