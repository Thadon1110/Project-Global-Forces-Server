require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const pug = require('pug');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// ROUTES
const userRouter = require('./routes/authenticationRoutes');
const defaultRouter = require('./routes/defaultRoutes');
const emailRouter = require('./routes/emailRoutes');

// Start Express App
const app = express();
// Let's Server Use Json
app.use(express.json());

app.use(cookieParser('secret'));

// Dodaj body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Połączenie z bazą danych MongoDB
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
	console.log('Connected to MongoDB');
});

// Ustawienie statycznego katalogu dla plików
app.use(express.static(path.join(__dirname, 'public')));

// // Ustawienie katalogu dla szablonów Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use((req, res, next) => {
	const token = req.signedCookies.token;
	try {
		if (token) {
			const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			req.user = user;
		}
	} catch (err) {
		res.clearCookie('token');
	}

	if (token) {
		res.locals.loggedIn = true;
	} else {
		res.locals.loggedIn = null;
	}

	next();
});

app.use('', userRouter);
app.use('', emailRouter);
app.use('', defaultRouter);

// Obsługa błędu 404 - trasa nie znaleziona
app.use((req, res, next) => {
	const originalUrl = req.originalUrl;
	res.status(404).render('error', {
		command: `show ${originalUrl.startsWith('/') ? originalUrl.slice(1) : originalUrl}`,
		message: `Error 404, page was not found`,
	});
});

// Obsługa innych błędów
app.use((err, req, res, next) => {
	res.status(500).render('error', {
		command: `huh?`,
		message: `Error 500, Internal Server Error`,
	});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});
