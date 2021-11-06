const express = require('express');
const router = express.Router();

const userControllers = require('./user.controllers');

router.get('/', userControllers.getUsers);
router.get('/:id', userControllers.getUserByID);
router.post('/registration', userControllers.postRegistration);
router.post('/login', userControllers.loginUser);
router.post('/send-sms', userControllers.sendSMS)
router.post('/verify-sms', userControllers.verifySMS)
// router.patch('/users/:id', userControllers.editUser);
router.delete('/:id', userControllers.deleteUser);

module.exports = router;