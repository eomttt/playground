const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movie.controller');

router.get('/get', () => {
    movieController.get();
});

module.exports = router;