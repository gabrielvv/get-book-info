const uploadController = require('../controllers/upload')
const express = require('express');
const router = express.Router();

router.get('/', uploadController.imageForm);
router.post('/', uploadController.uploadImage);

module.exports = router;