const express = require('express');
const router = express.Router();

const kjGlassController = require('../controllers/kjGlass.controller');

router.get('/get', () => {
    kjGlassController.get();
});

module.exports = router;
