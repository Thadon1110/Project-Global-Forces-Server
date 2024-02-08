const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware do weryfikacji tokena JWT
function authenticateToken(req, res, next) {
	const token = req.signedCookies.token;
	try {
		if (token) {
			if (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)) {
				next();
			} else {
				res.status(401).clearCookie('token').redirect('/');
			}
		}
	} catch (err) {
		res.status(401).clearCookie('token').redirect('/');
	}
}

router.get('/operation-room/', authenticateToken, (req, res) => {
	// const user = req.session.token;
	res.status(200).send(`Protected Content for user `);
});

module.exports = router;
