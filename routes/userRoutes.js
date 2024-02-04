const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/singup').post(authController.singup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// All of the following routes require token validation
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe); // TODO: Understand why do it
router.delete('/deleteMe', userController.deleteMe);
// user pohot update
router.post('/updateUserPhoto', userController.updateUserPhoto);

// All of the following routes only use by admin roles
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
