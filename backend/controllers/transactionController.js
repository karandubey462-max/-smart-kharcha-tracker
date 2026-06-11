const Transaction = require('../models/Transaction');

// GET /api/transactions
exports.getAll = async (req, res) => {
  try {
    const { month, type, category, search, limit = 100, page = 1 } = req.query;
    const filter = { user: req.user._id };

    if (month)    filter.date     = { $regex: `^${month}` };
    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (search)   filter.description = { $regex: search, $options: 'i' };

    const skip  = (Number(page) - 1) * Number(limit);
    const [txns, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1, time: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);
    res.json({ success: true, data: txns, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/transactions/:id
exports.getOne = async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: txn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/transactions
exports.create = async (req, res) => {
  try {
    const txn = await Transaction.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: txn });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/transactions/bulk — SMS/CSV import
exports.bulkCreate = async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0)
      return res.status(400).json({ success: false, message: 'transactions array required' });

    // Deduplicate by upiRef
    const existingRefs = await Transaction.find({
      user: req.user._id,
      upiRef: { $in: transactions.map(t => t.upiRef).filter(Boolean) },
    }).select('upiRef');
    const existingSet = new Set(existingRefs.map(t => t.upiRef));

    const toInsert = transactions
      .filter(t => !t.upiRef || !existingSet.has(t.upiRef))
      .map(t => ({ ...t, user: req.user._id }));

    const inserted = await Transaction.insertMany(toInsert, { ordered: false });
    res.status(201).json({
      success: true,
      inserted: inserted.length,
      skipped: transactions.length - inserted.length,
      data: inserted,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/transactions/:id
exports.update = async (req, res) => {
  try {
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!txn) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: txn });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/transactions/:id
exports.remove = async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/transactions/summary — monthly stats
exports.summary = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const txns  = await Transaction.find({ user: req.user._id, date: { $regex: `^${month}` } });

    const income  = txns.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lent    = txns.filter(t => t.type === 'lent'   ).reduce((s, t) => s + t.amount, 0);
    const borrowed= txns.filter(t => t.type === 'borrowed').reduce((s, t) => s + t.amount, 0);

    const categoryBreakdown = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    res.json({ success: true, data: { month, income, expense, savings: income - expense, lent, borrowed, categoryBreakdown, count: txns.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
