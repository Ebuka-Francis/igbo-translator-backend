const express = require('express');

const batchController = require('../controllers/batch');

const router = express.Router();

router.use('/api/batch', batchController.handelBatch);

module.exports = router;
