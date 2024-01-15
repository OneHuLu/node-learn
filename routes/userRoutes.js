const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/singup').post(authController.singup);
router.route('/login').post(authController.login);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch('/updateMe', authController.protect, userController.updateMe); // TODO: Understand why do it
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/').get(authController.protect, userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
