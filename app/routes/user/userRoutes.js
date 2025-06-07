const express = require('express');
const AuthController = require('../../controllers/authController');
const { fileUploader } = require('../../utils/fileUploader');
const router = express.Router();

router.post('/sign-up', fileUploader('profileImage'), AuthController.signup);
router.post('/verify', AuthController.verifyOTP);
router.post('/login', AuthController.login);

module.exports = router;