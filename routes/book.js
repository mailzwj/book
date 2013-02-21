/*
 * about books.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");
var bcol = db.collection("books");
exports.add = function(bookname, pic, author, publish_house, publish_date, recommend, isbn, book_cate, book_number, callback){
	//add book
	if(bookname && book_cate && isbn){
		var pic = pic ? pic : "",
			author = author ? author : "",
			publish_house = publish_house ? publish_house : "",
			publish_date = publish_date ? publish_date : "",
			recomend = recomend ? recomend : "暂无推荐信息",
			book_number = book_number ? book_number : 1;
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
	bcol.find({}, {"limit": len, "skip": start}).toArray(function(err, rs){
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
			book_number = book_number ? book_number : 1;
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
exports.del = function(bid){
	//delete book
};

//判断图书可借状态，返回bool
exports.canborrow = function(uid){
	//是否可借
};

exports.pushborrow = function(username, bookname, book_id, book_cate, apply_time){
	//将申请放入借书申请列表
};

exports.pullborrow = function(username, book_id){
	//通过或拒绝的借书申请，从临时表删除记录
};

exports.pushreturn = function(username, bookname, book_id, book_cate, also_time){
	//将还书申请放入临时表
};

exports.pullreturn = function(username, book_id){
	//通过或拒绝的还书申请，从临时表删除记录
};