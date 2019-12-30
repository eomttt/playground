const express = require('express');
const router = express.Router();

const lkLabController = require('../controllers/lkLab.controller');

router.get('/get', async (req, res) => {
    try {
        const result = await lkLabController.get(req.query.type, req.query.pageNumber);
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/getSpec', async (req, res) => {
    try {
        const result = await lkLabController.getSpec();
        res.send(result);
    } catch (error) {
        res.sstatus(500).send(error);
    }
});

module.exports = router;
