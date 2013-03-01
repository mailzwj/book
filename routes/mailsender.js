/*
 * 邮件模块.
 */

var mail = require("./mail");
var books = require("./book");
var users = require("./user");

setTimeout(function () {
	books.findduebook(function(rs){
		if(rs){
			for(var i = 0; i < rs.length; i++){
				(function(item){
					users.findemail(item.username, function(email){
						if(email){
							mail.send({
						        to: email, // list of receivers
						        subject: "借阅超时提醒", // Subject line
						        //text: "//, // plaintext body
						        html: "<strong>" + item.username + "</strong>，您好！<br>您在我馆借阅的图书<strong>《" + item.bookname + "》</strong>已过期，请您尽快归还至对应管理员处。" // html body
						    });
						}
					});
				})(rs[i]);
			}
		}
	});
}, 24 * 3600);
