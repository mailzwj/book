/***
 * 如果开启了mongoDB,将下面代码注释去掉，
 * 并将dbUserName, dbPassword和dbName都
 * 替换成分配得到的值。即可查看 mongoDB
 * 测试程序。否则则开启hello world程序。
 ***/

var mongo = require("mongoskin");
var user = "yrVkrVLEwSJk",
    pwd = "kRGCdu7BYK",
    host = "127.0.0.1",
    port = "20088",
    db = "RoPZp2ieJYBZ";

var db_url = exports.db_url = user + ":" + pwd + "@" + host + ":" + port + "/" + db;
exports.db = mongo.db(db_url);
