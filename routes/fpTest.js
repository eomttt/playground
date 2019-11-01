const express = require('express');
const router = express.Router();

const fpTestController = require('../controllers/fpTest.controller');

router.get('/test', () => {
    fpTestController.test();
});

module.exports = router;