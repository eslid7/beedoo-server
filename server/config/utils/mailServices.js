var nodemailer = require("nodemailer");

module.exports = {

	sendMail: function( mailContent, callback) {
		var smtpTransport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "beedooserver@gmail.com",
				pass: "asp128soin"
			}
		});

		var contentToSend = {
			from: "beedooServer <no-reply@beedooServer.cr>",
			to: mailContent.to,
			subject: ((mailContent.subject) ? mailContent.subject : "Mensaje de beedooServer")
		};

		if (mailContent.isText) {
			contentToSend.text = mailContent.msn;
		} else {
			contentToSend.html = mailContent.msn;
		}

		if (mailContent.attachments) {
			contentToSend.attachments = mailContent.attachments;
		}

		smtpTransport.sendMail(contentToSend, function (error, info) {
            var resp;
            if (error) {
				console.log('Error occurred' + error );
                resp = {
                	code: 404,
                	message: '' + error
                };
            } else {
				console.log('Server responded with "%s"', info.response);
                resp = {
                	code: 200,
                	message: 'Email Enviado correctamente!'
                };
            }
            if (callback) {
				callback(resp);
			}
        });
	}
};