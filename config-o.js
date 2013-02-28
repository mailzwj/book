/***
 * 如果开启了mongoDB,将下面代码注释去掉，
 * 并将dbUserName, dbPassword和dbName都
 * 替换成分配得到的值。即可查看 mongoDB
 * 测试程序。否则则开启hello world程序。
 ***/
var mongo = require("mongoskin");
var dburls = {
    dev: ":@127.0.0.1:27017/books",
	online: "yrVkrVLEwSJk:kRGCdu7BYK@127.0.0.1:20088/RoPZp2ieJYBZ"
};
exports.ports = {
	mac: 8088,
	remote: 8080
};
var db_url = exports.db_url = dburls.dev;
exports.db = mongo.db(db_url);
exports.errs = {
	10000: "用户名已存在",
	10001: "两次输入密码不一致",
	10002: "账号或密码错误",
	10003: "其他错误"
};
