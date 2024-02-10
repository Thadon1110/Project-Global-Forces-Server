const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	res.render('index', { title: '- Globe' });
});

router.get('/about', (req, res) => {
	res.render('about', { title: '- About us' });
});

router.get('/donate', (req, res) => {
	res.render('donate', { title: '- Donate' });
});

router.get('/factions', (req, res) => {
	res.render('factions', { title: '- Factions' });
});

router.get('/how-to-join', (req, res) => {
	res.render('how-to-join', { title: '- Factions' });
});

router.get('/mods', (req, res) => {
	res.render('mods', { title: '- Mods' });
});

router.get('/organizations', (req, res) => {
	res.render('organizations', { title: '- Organizations' });
});

router.get('/privacy-policy', (req, res) => {
	res.render('privacy-policy', { title: '- Privacy & Policy' });
});

router.get('/globe', (req, res) => {
	res.render('globe', { title: '- Globe' });
});

module.exports = router;
