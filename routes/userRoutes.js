const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/singup').post(authController.singup);
router.route('/login').post(authController.login);

router.route('/forgetPassword').post(authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(
    userController.checkName,
    userController.checkId,
    userController.createUser
  );

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
