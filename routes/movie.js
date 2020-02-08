const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movie.controller');

router.get('/get-region', async (req, res) => {
    try {
        const { type } = req.query;
        const result = await movieController.getRegion(type);
        res.send(result);
    } catch (error) {
        console.log('Movie get region error', error);
    }
});

router.get('/get-theaters-by-region', async (req, res) => {
    try {
        const { type, regionIndex } = req.query;
        const result = await movieController.getTheatersByRegion(type, regionIndex);
        res.send(result);
    } catch (error) {
        console.log('Movie get theaters error', error);
    }
});

router.get('/time-table', async (req, res) => {
    try {
        const { type, theaterLink } = req.query;
        const result = await movieController.getTimeTalbe(type, decodeURI(theaterLink));
        res.send(result);
    } catch (error) {
        console.log('Movie get time table error', error);
    }
});

module.exports = router;
