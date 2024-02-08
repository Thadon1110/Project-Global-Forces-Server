const express = require('express');
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const router = express.Router();

const defaultCookieAge = 3600; // 1 Hour
const loginLimiter = rateLimit({
	windowMs: 30 * 60 * 1000,
	max: 3,
	message: 'Too many login attempts. Please try again later.',
});

function sendVerificationEmail(email, verificationToken) {
	const transporter = nodemailer.createTransport({
		host: 'mail-serwer251063.lh.pl',
		port: 465,
		secure: true,
		auth: {
			user: 'contact@armapgf.eu',
			pass: `${process.env.EMAIL_PASS}`,
		},
	});

	const verificationLink = `${process.env.BASE_URL}/verify-email/${verificationToken}`;

	const mailOptions = {
		from: 'noreply@armapgf.eu',
		to: email,
		subject: 'Email Verification',
		text: `Click the following link to verify your email: ${verificationLink}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
		}
	});
}

router
	.route('/sign-in')
	.get((req, res) => {
		res.render('sign-in', { title: '- Sign In' });
	})
	.post(loginLimiter, async (req, res) => {
		try {
			const user = await UserModel.findOne({ email: req.body.email }).select('+password');

			if (!user) {
				delete user.password;
				res.status(400).render('error', { title: '- Email', command: `verify ${user.email}`, message: 'Cannot find user' });
			}

			if (!user.verified) {
				delete user.password;
				res.status(401).render('error', { title: '- Email', command: `verify ${user.email}`, message: 'Email not verified' });
			}

			if (await bcrypt.compare(req.body.pass, user.password)) {
				delete user.password;

				const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: defaultCookieAge });

				res.cookie('token', token, {
					httpOnly: true,
					secure: false,
					signed: true,
					maxAge: defaultCookieAge * 1000,
					sameSite: 'Strict',
				});

				res.status(200).redirect('/');
			} else {
				res.status(401).render('sign-in', { title: '- Sign In', command: `login ${user.email}`, message: 'Password is invalid' });
			}
		} catch (err) {
			res.status(500).render('error', { title: '- Sign In', command: `login`, message: `Error 500, Internal Server Error` });
		}
	});

router
	.route('/sign-up')
	.get((req, res) => {
		res.render('sign-up', { title: '- Sign Up' });
	})
	.post(
		[
			// prettier-ignore
			body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
			body('pass').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
			body('steamid').isAlphanumeric().withMessage('Steam ID must be alphanumeric'),
			body('discordid').isNumeric().withMessage('Discord ID must be numeric'),
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// return res.status(400).json({ errors: errors.array() });
				res.status(400).render('sign-up', { title: '- Sign Up', errors: errors.array(), command: `register ${req.body.email}` });
			}

			try {
				const hashedPassword = await bcrypt.hash(req.body.pass, 10);
				const verificationToken = jwt.sign({ email: req.body.email }, process.env.EMAIL_VERIFICATION_SECRET);
				const user = new UserModel({
					email: req.body.email,
					password: hashedPassword,
					position: 'verification',
					media: [req.body.steamid, req.body.discordid],
					org: 'none',
					verificationToken: verificationToken,
				});

				await user.save();

				// Wysyłanie emaila weryfikacyjnego
				sendVerificationEmail(req.body.email, verificationToken);

				res.status(201).render('info', {
					title: '- Sign Up',
					command: `register user.email`,
					message: `Email was successfully sent! Please go to your email and verify yourself.`,
				});
			} catch (err) {
				res.status(500).render('error', { title: '- Sign Up', command: `register`, message: `${err.message}` });
			}
		}
	);

router.get('/logout', (req, res) => {
	try {
		res.clearCookie('token').redirect('/');
	} catch (err) {
		res.status(500).render('error', { title: '- Sign Up', command: `logout`, message: `Error 500, Internal Server Error` });
	}
});

module.exports = router;
