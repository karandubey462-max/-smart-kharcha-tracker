const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  phone:        { type: String, trim: true },
  pin:          { type: String, select: false },        // hashed 4-digit PIN
  currency:     { type: String, default: 'INR' },
  language:     { type: String, default: 'en' },
  theme:        { type: String, enum: ['dark','light'], default: 'dark' },
  monthlyBudget:{ type: Number, default: 25000 },
  pinEnabled:   { type: Boolean, default: false },
  avatar:       { type: String, default: null },
  isDemo:       { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Hash PIN before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('pin') || !this.pin) return next();
  this.pin = await bcrypt.hash(this.pin, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};
userSchema.methods.matchPin = async function (entered) {
  return bcrypt.compare(entered, this.pin);
};

module.exports = mongoose.model('User', userSchema);
