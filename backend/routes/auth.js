const express = require('express');
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/authController');

const router = express.Router();

router.post('/register',    ctrl.register);
router.post('/login',       ctrl.login);
router.post('/demo',        ctrl.demo);
router.post('/verify-pin',  auth, ctrl.verifyPin);
router.post('/set-pin',     auth, ctrl.setPin);
router.get('/me',           auth, ctrl.getMe);

module.exports = router;
