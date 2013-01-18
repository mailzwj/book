
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render("index", {title: "我的图书管理系统"});
};