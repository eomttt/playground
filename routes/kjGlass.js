const express = require('express');
const router = express.Router();

const kjGlassController = require('../controllers/kjGlass.controller');

router.get('/get', async (req, res) => {
    try {
        const result = await kjGlassController.get(req.query.type, req.query.pageNumber);
        res.send(result);
    } catch (error) {
        res.error('Error' + error);
    }
});

router.get('/get-spec', async (req, res) => {
    try {
        const result = await kjGlassController.getSpec(null, req.query.type);
        res.send(result);
    } catch (error) {
        res.error('Error' + error);
    }
});

module.exports = router;
