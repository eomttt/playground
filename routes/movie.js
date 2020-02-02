const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movie.controller');

router.get('/get', async (req, res) => {
    try {
        const result = await movieController.get();
        res.send(result);
    } catch (error) {
        console.log('Movie get error', error);
    }
});

module.exports = router;
