const express = require('express');
const AuthController = require('../../controllers/authController');
const { fileUploader } = require('../../utils/fileUploader');
const auth = require('../../middlewares/auth');
const UserController = require('../../controllers/userController');
const router = express.Router();

router.post('/sign-up', fileUploader('profileImage'), AuthController.signup);
router.post('/verify', AuthController.verifyOTP);
router.post('/login', AuthController.login);
router.get('/profile', auth, UserController.getUser); // Assuming this route is for getting user details
router.put('/profile-image/update', auth, fileUploader('profileImage'), UserController.updateProfileImage);

module.exports = router;