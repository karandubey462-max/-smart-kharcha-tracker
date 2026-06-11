const express = require('express');
const auth    = require('../middleware/auth');
const LendBorrow = require('../models/LendBorrow');

const router = express.Router();
router.use(auth);

// GET all
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    const records = await LendBorrow.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const lb = await LendBorrow.create({
      ...req.body, user: req.user._id,
      balanceRemaining: req.body.amount,
    });
    res.status(201).json({ success: true, data: lb });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// POST repayment
router.post('/:id/repayment', async (req, res) => {
  try {
    const lb = await LendBorrow.findOne({ _id: req.params.id, user: req.user._id });
    if (!lb) return res.status(404).json({ success: false, message: 'Not found' });
    lb.addRepayment(req.body);
    await lb.save();
    res.json({ success: true, data: lb });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const lb = await LendBorrow.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!lb) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: lb });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await LendBorrow.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
