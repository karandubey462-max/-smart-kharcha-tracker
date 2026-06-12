const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { parseSMSText } = require('../utils/smsParser');

const router = express.Router();

// POST /api/webhook/sms/:userId
router.post('/sms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Capture SMS body from various standard webhook payload formats
    const smsText = req.body.text || 
                    req.body.message || 
                    req.body.body || 
                    req.body.content || 
                    req.body.sms || 
                    req.body.msg || 
                    req.body.smsText ||
                    req.body.value;

    if (!smsText || typeof smsText !== 'string') {
      return res.status(400).json({ success: false, message: 'SMS text body is required' });
    }

    // Parse the SMS text
    const parsed = parseSMSText(smsText);

    // If it's not a financial transaction SMS, ignore it but return 200 OK so the hook app knows we received it successfully
    if (!parsed) {
      return res.status(200).json({ 
        success: true, 
        message: 'Message received but ignored (does not match transaction SMS patterns)' 
      });
    }

    // Deduplicate by upiRef (if exists)
    if (parsed.upiRef) {
      const existing = await Transaction.findOne({ user: userId, upiRef: parsed.upiRef });
      if (existing) {
        return res.status(200).json({ 
          success: true, 
          message: 'Duplicate transaction skipped', 
          data: existing 
        });
      }
    }

    // Determine category based on transaction type
    const category = parsed.type === 'income' ? 'Salary' : 'Others';

    // Create the transaction
    const txn = await Transaction.create({
      user: userId,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description || 'UPI Transaction',
      category: category,
      date: parsed.date || new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentApp: parsed.paymentApp || 'other',
      source: 'sms',
      tags: parsed.type === 'income' ? 'personal' : 'personal',
      upiRef: parsed.upiRef || '',
      notes: parsed.notes || 'Auto-parsed from SMS webhook',
      status: 'completed'
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction auto-created from SMS successfully',
      data: txn
    });

  } catch (err) {
    console.error('Webhook SMS Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
  }
});

module.exports = router;
