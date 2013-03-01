/*
 * 邮件模块.
 */

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "booketao@gmail.com",
        pass: "etaoux123"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "booketao<booketao@gmail.com>", // sender address
    to: "lingwu.tyf@taobao.com", // list of receivers
    subject: "AC4 coming!", // Subject line
    text: "AC4 is about to come on 4 March!", // plaintext body
    html: "<b>go get it!!!</b>" // html body
};

exports.send = function (userMailOptions) {
	userMailOptions.from = userMailOptions.from || mailOptions;
	// send mail with defined transport object
	smtpTransport.sendMail(userMailOptions, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}

		// if you don't want to use this transport object anymore, uncomment following line
		// smtpTransport.close(); // shut down the connection pool, no more messages
	});
};