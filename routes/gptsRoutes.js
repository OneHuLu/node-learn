const express = require('express');

const gptsController = require('../controller/gptsController.js');

const router = express.Router();

router.use(gptsController.setConfig)
router.route('/ask').post(gptsController.ask);

module.exports = router;
