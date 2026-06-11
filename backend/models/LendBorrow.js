const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date:   { type: String, required: true },
  notes:  { type: String },
}, { _id: true, timestamps: true });

const lendBorrowSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:             { type: String, enum: ['lent','borrowed'], required: true },
  personName:       { type: String, required: true, trim: true },
  personPhone:      { type: String, trim: true },
  amount:           { type: Number, required: true, min: 0 },
  date:             { type: String, required: true },
  dueDate:          { type: String },
  notes:            { type: String },
  status:           { type: String, enum: ['unpaid','partial','paid'], default: 'unpaid' },
  amountRecovered:  { type: Number, default: 0 },
  balanceRemaining: { type: Number, default: 0 },
  reminderEnabled:  { type: Boolean, default: true },
  repayments:       [repaymentSchema],
}, { timestamps: true });

// Auto-update balance and status after repayment
lendBorrowSchema.methods.addRepayment = function (rep) {
  this.repayments.push(rep);
  this.amountRecovered  = this.repayments.reduce((s, r) => s + r.amount, 0);
  this.balanceRemaining = Math.max(this.amount - this.amountRecovered, 0);
  this.status = this.balanceRemaining === 0 ? 'paid' : this.amountRecovered > 0 ? 'partial' : 'unpaid';
};

module.exports = mongoose.model('LendBorrow', lendBorrowSchema);
