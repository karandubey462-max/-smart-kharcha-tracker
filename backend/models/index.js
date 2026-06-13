const mongoose = require('mongoose');

// Budget
const budgetCategorySchema = new mongoose.Schema({
  categoryId: String,
  allocated:  Number,
  color:      String,
}, { _id: false });

const budgetSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  totalBudget: { type: Number, default: 25000 },
  month:       { type: String, required: true }, // YYYY-MM
  categories:  [budgetCategorySchema],
}, { timestamps: true });

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

// Savings Goal
const savingsGoalSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:          { type: String, required: true },
  targetAmount:  { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline:      { type: String },
  icon:          { type: String, default: '🎯' },
  color:         { type: String, default: '#6C63FF' },
  isCompleted:   { type: Boolean, default: false },
}, { timestamps: true });

// Recurring Expense
const recurringSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:       { type: String, required: true },
  amount:     { type: Number, required: true },
  categoryId: { type: String },
  frequency:  { type: String, enum: ['daily','weekly','monthly','yearly'], default: 'monthly' },
  nextDue:    { type: String },
  isActive:   { type: Boolean, default: true },
  autoAdd:    { type: Boolean, default: false },
}, { timestamps: true });

// Reminder
const reminderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, enum: ['lend','borrow','budget','recurring','custom'], default: 'custom' },
  refId:   { type: String },
  title:   { type: String, required: true },
  message: { type: String },
  dueDate: { type: String },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

// Review
const reviewSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  comment:     { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

module.exports = {
  Budget:     mongoose.model('Budget',     budgetSchema),
  SavingsGoal:mongoose.model('SavingsGoal',savingsGoalSchema),
  Recurring:  mongoose.model('Recurring',  recurringSchema),
  Reminder:   mongoose.model('Reminder',   reminderSchema),
  Review:     mongoose.model('Review',     reviewSchema),
};
