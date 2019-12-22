const express = require('express');
const router = express.Router();

const kjGlassController = require('../controllers/kjGlass.controller');

router.get('/get', async (req, res) => {
    try {
        const result = await kjGlassController.get(req.query.type);
        console.log('Get result', result);
        res.send(result);
    } catch (error) {
        res.error('Error' + error);
    }
});

router.get('/get-spec', () => {
    kjGlassController.getSpec();
});

module.exports = router;
