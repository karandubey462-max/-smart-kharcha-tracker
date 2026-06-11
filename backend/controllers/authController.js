const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/demo — create ephemeral demo session
exports.demo = async (req, res) => {
  try {
    let demo = await User.findOne({ isDemo: true, email: 'demo@smartkharcha.app' });
    if (!demo) {
      demo = await User.create({
        name: 'Demo User', email: 'demo@smartkharcha.app',
        password: 'demo_password_123', isDemo: true,
      });
    }
    sendToken(demo, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-pin
exports.verifyPin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+pin');
    if (!user.pin)
      return res.status(400).json({ success: false, message: 'No PIN set' });
    const ok = await user.matchPin(req.body.pin);
    if (!ok)
      return res.status(401).json({ success: false, message: 'Incorrect PIN' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/set-pin
exports.setPin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.pin        = req.body.pin;
    user.pinEnabled = true;
    await user.save();
    res.json({ success: true, message: 'PIN set successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
