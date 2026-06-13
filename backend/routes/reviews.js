const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { Review } = require('../models/index');

// GET /api/reviews — public
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    const count   = reviews.length;
    const avg     = count > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1)
      : 0;
    res.json({ success: true, data: reviews, avgRating: parseFloat(avg), count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews — requires auth
router.post('/', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment)
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    if (comment.trim().length < 5)
      return res.status(400).json({ success: false, message: 'Comment is too short' });

    // One review per user (upsert)
    const existing = await Review.findOne({ user: req.user._id });
    let review;
    if (existing) {
      existing.rating  = rating;
      existing.comment = comment.trim();
      existing.displayName = req.user.name;
      review = await existing.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        displayName: req.user.name,
        rating,
        comment: comment.trim(),
      });
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
