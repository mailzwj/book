/*
 * about books.
 */

var config = require("../config");
var db = config.db;
var crypto = require("crypto");
var coll = db.collection("users");
var bcol = db.collection("books");
exports.add = function(bookname, pic, author, publish_house, publish_date, recommend, book_cate){
	//add book
};

//修改书籍信息
exports.update = function(bookname, pic, author, publish_house, publish_date, recommend, book_cate){
	//update book
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