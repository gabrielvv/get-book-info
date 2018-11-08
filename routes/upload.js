const common = require('../controllers/common')
const express = require('express');
const router = express.Router();

router.get('/', common.imageForm);
router.post('/', common.uploadImage);

module.exports = router;