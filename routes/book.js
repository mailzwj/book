/*
 * 图书模块
 */

var config = require("../config");
var db = config.db;
var bcol = db.collection("books");
var ls = db.collection("lendhistory");

exports.formatDate = function(date, style){  
	var y = date.getFullYear();    
	var M = "0" + (date.getMonth() + 1);    
	M = M.substring(M.length - 2);   
	var d = "0" + date.getDate();   
	d = d.substring(d.length - 2);    
	var h = "0" + date.getHours();    
	h = h.substring(h.length - 2);    
	var m = "0" + date.getMinutes();    
	m = m.substring(m.length - 2);   
	var s = "0" + date.getSeconds();    
	s = s.substring(s.length - 2);   
	return style.replace('yyyy', y).replace('mm', M).replace('dd', d).replace('hh', h).replace('ii', m).replace('ss', s);
};

exports.add = function(bookname, pic, author, publish_house, publish_date, recommend, isbn, book_cate, book_borrowed, book_total, callback){
	//add book
	if(bookname && book_cate && isbn){
		var pic = pic ? pic : "",
			author = author ? author : "",
			publish_house = publish_house ? publish_house : "",
			publish_date = publish_date ? publish_date : "",
			recomend = recomend ? recomend : "暂无推荐信息",
			book_number = book_number >= 0 ? book_number : 0;
		bcol.insert({bookname: bookname, pic: pic, author: author, publish_house: publish_house, publish_date: publish_date, borrow_times: 0, score: 0, isbn: isbn, recommend: recommend, book_cate: book_cate, book_borrowed: book_borrowed, book_total: book_total}, function(err){
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
//exports.update = function(bookname, pic, author, publish_house, publish_date, recommend, isbn, book_cate, book_borrowed, book_total, callback){
	exports.update = function(obj, callback){
	//update book
	if(obj.bookname && obj.book_cate && obj.isbn){
		var pic = obj.pic || "",
			author = obj.author || "",
			publish_house = obj.publish_house || "",
			publish_date = obj.publish_date || "",
			recommend = obj.recommend || "暂无推荐信息",
			book_total = obj.book_total >= 0 ? obj.book_total : 0;

		bcol.update({isbn: obj.isbn}, {"$set": {bookname: obj.bookname, pic: pic, author: author, publish_house: publish_house, publish_date: publish_date, score: 0, recommend: recommend, book_cate: parseInt(obj.book_cate), book_total: parseInt(book_total)}}, function(err){
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
	bcol.findOne({isbn: isbn, book_borrowed: 0}, function(err, book){
		if(err){
			callback("err", "系统错误。");
		}else{
			if(book){
				bcol.remove({isbn: isbn, book_borrowed: 0}, function(err){
					if(err){
						callback("err", "删除失败了，请重试！");
					}else{
						callback("success", "删除成功！");
					}
				});
			}else{
				callback("err", "参数错误。");
			}
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
			if(book && (book.book_total - book.book_borrowed) > 0){
				callback(true);
			}else{
				callback(false);
			}
		}
	});
};

exports.pushborrow = function(username, isbn, callback){
	//将申请放入借书申请列表
	bcol.findOne({isbn: isbn}, function(err, book){
		if(err){
			callback("err", "未知错误。");
		}else{
			if(book && (book.book_total - book.book_borrowed > 0)){
				bcol.update({isbn: isbn}, {"$inc": {book_borrowed: 1, borrow_times: 1}}, function(err){
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

exports.getborrowlist = function(cate, status, callback){
	var findcon = {status: status};
	if(typeof cate === "number"){
		findcon.book_cate = cate;
	}

	ls.find(findcon, {sort: [["borrow_time", "desc"]]}).toArray(function(err, rs){
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

exports.getmyborrow = function(username, callback){
	ls.find({username: username}, {sort: [["borrow_time", "desc"]]}).toArray(function(err, rs){
		if(err){
			callback("err", "查询历史记录失败。");
		}else{
			if(rs){
				callback("success", rs);
			}else{
				callback("err", "未找到相关记录。");
			}
		}
	});
};

exports.checkborrow = function(flag, id, isbn, callback){
	//通过或拒绝的借书申请，修改借阅历史表中对应记录状态标识
	if(flag === "pass"){
		ls.update({_id: ls.id(id)}, {"$set": {status: 3}}, function(err){
			if(err){
				callback("err", "用户借阅申请审核失败。");
			}else{
				callback("success", "审核通过。");
			}
		});
	}else if(flag === "cancel"){
		ls.update({_id: ls.id(id)}, {"$set": {status: 4}}, function(err){
			if(err){
				callback("err", "拒绝借阅申请审核失败。");
			}else{
				bcol.update({isbn: isbn}, {"$inc": {book_borrowed: -1}}, function(err){
					if(err){
						callback("err", "拒绝借阅申请审核失败。");
					}else{
						callback("success", "拒绝成功。");
					}
				});
			}
		});
	}
};

exports.checkreturn = function(id, isbn, callback){
	//通过或拒绝的还书申请，修改借阅历史表中对应记录状态标识
	ls.update({_id: ls.id(id)}, {"$set": {status: 5, return_time: new Date()}}, function(err){
		if(err){
			callback("err", "还书失败。");
		}else{
			bcol.update({isbn: isbn}, {"$inc": {book_borrowed: -1}}, function(err){
				if(err){
					callback("err", "还书失败。");
				}else{
					callback("success", "还书成功。");
				}
			});
		}
	});
};

exports.cancelborrow = function(id, isbn, callback){
	ls.update({_id: ls.id(id)}, {"$set": {status: 2, return_time: new Date()}}, function(err){
		if(err){
			callback("err", "取消失败，请重新尝试。");
		}else{
			bcol.update({isbn: isbn}, {"$inc": {book_borrowed: -1}}, function(err){
				if(err){
					callback("err", "取消失败，请重新尝试。");
				}else{
					callback("success", "借书申请已取消。");
				}
			});
		}
	});
};

exports.getbook = function(isbn, callback){
	bcol.findOne({isbn: isbn}, function(err, obj){
		if(err){
			callback("err", "系统错误。");
		}else{
			if(obj){
				callback("success", obj);
			}else{
				callback("err", "未找到相关图书。");
			}
		}
	});
};

exports.getdetail = function(isbn, callback){
	bcol.findOne({isbn: isbn}, function(err, book){
		if(err){
			callback("err", "系统错误。");
		}else{
			if(book){
				//callback("success", book);
				ls.find({isbn: isbn}, {sort: [["borrow_time", "desc"]]}).toArray(function(err, rs){
					if(err){
						callback("err", "获取借阅历史失败。");
					}else{
						if(rs){
							for(var i = 0; i < rs.length; i++){
								if(rs[i].status !== 1){
									var bt = rs[i].borrow_time;
									rs[i].borrow_time = exports.formatDate(bt , "yyyy-mm-dd hh:ii:ss");
									rs[i].return_time = exports.formatDate(new Date(rs[i].return_time), "yyyy-mm-dd hh:ii:ss");
									rs[i].holdtime = new Date(bt - new Date(rs[i].return_time)).getDate();
								}else{
									rs[i].borrow_time = exports.formatDate(rs[i].borrow_time , "yyyy-mm-dd hh:ii:ss");
								}
							}
							book.history = rs;
						}else{
							book.history = null;
						}
						callback("success", book);
					}
				});
			}else{
				callback("err", "未找到相关图书。");
			}
		}
	});
};

exports.findduebook = function(callback){
	ls.find({status: 3, return_time: {"$lt": new Date()}}).toArray(function(err, rs){
		if(err){
			throw err;
		}else{
			if(rs){
				callback(rs);
			}else{
				callback(null);
			}
		}
	});
};

exports.pushcomment = function(isbn, username, comment, callback){
	bcol.update({isbn: isbn}, {"$push": {comments: {username: username, content: comment}}}, function(err){
		if(err){
			callback("err", "系统错误。");
		}else{
			callback("success", "评论成功。");
		}
	});
};

exports.mborrow = function(isbn, username, callback){
	bcol.findOne({isbn: isbn}, function(err, book){
		if(err){
			callback("err", "系统错误。");
		}else{
			if(!book){
				callback("err", "图书不存在。");
			}else{
				bcol.update({isbn: isbn}, {"$inc": {book_borrowed: 1, borrow_times: 1}}, function(err){
					if(err){
						callback("err", "系统错误。");
					}else{
						var date = new Date();
						ls.insert({username: username, isbn: isbn, bookname: book.bookname, borrow_time: date, return_time: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), status: 3,book_cate: book.book_cate}, function(err){
							if(err){
								callback("err", "借书申请发送失败，请重新尝试。");
							}else{
								callback("success", book.bookname);
							}
						});
					}
				});
			}
		}
	});
};