/*
 * 邮件模块.
 */

var mail = require("./mail");

setTimeout(function () {
    mail.send({
        to: "lingwu.tyf@taobao.com", // list of receivers
        subject: "AC3 coming!", // Subject line
        text: "AC3 is about to come on 4 March!", // plaintext body
        html: "<b>go get it!!!</b>" // html body
    });
}, 10);
