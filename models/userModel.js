const mongoose = require('mongoose');

// Definicja schematu użytkownika
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, 'Please provide your password'],
		minlength: [8, 'Password must be at least 8 characters long'],
		select: false,
	},
	position: {
		type: String,
		required: [true, 'Please provide your position'],
		enum: ['verification', 'logistician', 'advisor', 'co-leader', 'leader', 'admin'],
		lowercase: true,
		default: 'guest',
	},
	media: {
		type: Array,
		required: [true, 'Please provide your SteamID and DiscordID'],
		validate: {
			validator: function (arr) {
				return new Set(arr).size === arr.length;
			},
			message: 'SteamID and DiscordID must be unique',
		},
		unique: true,
	},
	org: {
		type: String,
		required: [true, 'Please provide your organization'],
		enum: ['none', 'poland', 'greece'],
		default: 'none',
		lowercase: true,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	verificationToken: String,
});

// Tworzenie modelu na podstawie schematu i jego eksport
module.exports = mongoose.model('accounts', userSchema);
