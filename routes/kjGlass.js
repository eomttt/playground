const express = require('express');
const router = express.Router();

const kjGlassController = require('../controllers/kjGlass.controller');

router.get('/get', () => {
    kjGlassController.get();
});

router.get('/get-spec', () => {
    kjGlassController.getSpec();
});

module.exports = router;
