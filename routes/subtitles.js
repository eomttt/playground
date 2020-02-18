const express = require('express');
const router = express.Router();

const subTitlesController = require('../controllers/subTitles.controller');

router.post('/start', async (req, res) => {
    // try {
    //     await subTitlesController.start();
    //     res.send('Success');
    // } catch (error) {
    //     console.log('Google cloud speech start error', error);
    // }
});

module.exports = router;
