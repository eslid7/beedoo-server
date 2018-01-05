// útiles

module.exports = {
	encryptData: function( dataToEncrypt, algorithm, key, errorMsn ) {
		try {
			var crypto = require('crypto'),
				keyHash = crypto.createHash('sha256').update(key).digest('base64'),
				keyBuf = new Buffer( Array(32) );

			keyBuf.write( keyHash, 'base64' );

			var	ivBuf = new Buffer( Array(16) ),
				cipher = crypto.createCipheriv(algorithm, keyBuf, ivBuf);

			output = cipher.update(dataToEncrypt, 'utf-8', 'base64') + cipher.final('base64');
			return output;
		} catch(err) {
			console.log( "Error al encriptar " + errorMsn + ". " + err);
		}
	},
	decryptData: function( dataToDencrypt, algorithm, key, errorMsn ) {
		try {
			var crypto = require('crypto'),
				keyHash = crypto.createHash('sha256').update(key).digest('base64'),
				keyBuf = new Buffer( Array(32) );

			keyBuf.write( keyHash, 'base64' );

			var	ivBuf = new Buffer( Array(16) ),
				deCipher = crypto.createDecipheriv(algorithm, keyBuf, ivBuf);
			decrypted = deCipher.update(dataToDencrypt,'base64','utf-8') + deCipher.final('utf-8');
			return decrypted;
		} catch(err) {
			console.log( "Error al Desencriptar " + errorMsn + ". " + err);
		}
	}
};
