const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:        { type: String, enum: ['expense','income','lent','borrowed','refund','repayment'], required: true },
  amount:      { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  category:    { type: String, required: true },
  date:        { type: String, required: true },   // YYYY-MM-DD
  time:        { type: String, default: '00:00' }, // HH:MM
  paymentApp:  { type: String, enum: ['phonepe','gpay','paytm','bank','cash','card','upi','other'], default: 'other' },
  accountId:   { type: String },
  source:      { type: String, enum: ['auto','manual','sms','csv'], default: 'manual' },
  tags:        { type: String, enum: ['personal','family','business','investment','loan'], default: 'personal' },
  upiRef:      { type: String, trim: true },
  notes:       { type: String, trim: true },
  personName:  { type: String },
  status:      { type: String, enum: ['completed','pending','failed'], default: 'completed' },
  isRecurring: { type: Boolean, default: false },
  recurringId: { type: String },
}, { timestamps: true });

// Compound index for fast monthly queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, upiRef: 1 }, { sparse: true });

module.exports = mongoose.model('Transaction', transactionSchema);
