'use strict';

const read = require('read')
const CryptoJS = require("crypto-js");

const handleReadErr = err => console.log(`Problem reading input.%n ${err}`);
const handleDecryptError = err => {
	console.log(`Failed to decrypt text, probably the incorrect pwd.`);
	if (err) console.log(err);
}

const decrypt = (text, pwd) => {
	const bytes = CryptoJS.AES.decrypt(text.toString(), pwd);
	const plaintext = bytes.toString(CryptoJS.enc.Utf8);

	return plaintext;
};

const encrypt = (text, pwd) => CryptoJS.AES.encrypt(text.toString(), pwd).toString();

read({ prompt: 'Password: ', silent: true }, (err, pwd) => {
	if (err) return handleReadErr(err);

	pwd = pwd.trim();

	read({ prompt: 'Paste encrypted passwords file or press enter if creating a new file:'}, (err, encryptedText) => {
		let decryptedText;
		try {
			decryptedText = decrypt(encryptedText, pwd);			
		} catch (e) {
			return handleDecryptError(e);
		} finally {
			if (!decryptedText) return handleDecryptError();
		}

		read({ prompt: 'Enter "d" for decrypt, or enter "a" for append to or create a file:'}, (err, input) => {
			if (err) return handleReadErr(err);

			input = input.trim();
			if (input === 'd') {
				return console.log(decryptedText);
			}

			if (input === 'a') {
				return read({ prompt: 'Enter new password data, use new line char for new lines:' }, (err, plaintextPwd) => {
					if (err) return handleReadErr(err);

					plaintextPwd = plaintextPwd.trim();
					plaintextPwd = plaintextPwd.split('\\n').reduce((acc, item) => {
						acc += '\n' + item;
						return acc;
					}, '');
					const appendedPlainText = decryptedText + '\n' + plaintextPwd;
					const appendedEncryptedText = encrypt(appendedPlainText, pwd);
					console.log('New encrypted passwords:');
					console.log(appendedEncryptedText);
				})
			}

			return console.log('Please enter d or a.');
		});
	});
});