const express = require('express');
const router = express.Router();

const kjGlassController = require('../controllers/kjGlass.controller');

router.get('/get', async (req, res) => {
    try {
        const result = await kjGlassController.get(req.query.type, req.query.pageNumber);
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/get-spec', async (req, res) => {
    try {
        const result = await kjGlassController.getSpec(null, req.query.type);
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/upload-image', async (req, res) => {
    try {
        const result = await kjGlassController.uploadImage(req.query.imageUrl);
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/update', async (req, res) => {
    try {
        const result = await kjGlassController.updateData(req.body);
        res.send(result);
    } catch (error) {
        console.log('error', error);
        res.status(500).send(error);
    }
});

router.get('/get-data', async (req, res) => {
    try {
        const result = await kjGlassController.getData(req.query.type);
        res.send(result);
    } catch (error) {
        console.log('error', error);
        res.status(500).send(error);
    }
});

module.exports = router;
