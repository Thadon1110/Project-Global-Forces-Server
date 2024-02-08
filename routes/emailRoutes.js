const express = require('express');
const UserModel = require('../models/userModel');

const router = express.Router();

router.get('/verify-email/:token', async (req, res) => {
	const token = req.params.token;

	try {
		// Sprawdź, czy token jest prawidłowy
		const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

		// Znajdź użytkownika w bazie danych na podstawie zdekodowanego tokenu
		const user = await UserModel.findOne({ email: decoded.email });

		if (!user) {
			res.status(401).render('error', { title: '- Email', command: `verify ${user.email}`, message: 'User not found' });
		}

		// Ustaw pole verified na true
		user.verified = true;
		await user.save();

		res.status(200).redirect('/');
	} catch (err) {
		res.status(500).redirect('/');
	}
});

module.exports = router;
