// dotenv: load .env in local dev; on Vercel env vars are injected automatically
require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');

const { Budget, SavingsGoal, Recurring, Reminder } = require('./models/index');
const auth = require('./middleware/auth');

// ── Connect to MongoDB ──
connectDB();

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5174',
    'https://smart-kharcha.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate Limiting ──
app.use('/api/', rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      Number(process.env.RATE_LIMIT_MAX)        || 200,
  message:  { success: false, message: 'Too many requests, please try again later.' },
}));

// ── Health Check ──
app.get('/',        (_, res) => res.json({ status: 'ok', app: 'Smart Kharcha API', version: '1.0.0' }));
app.get('/health',  (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API Routes ──
// Note: On Vercel, /api/* routes are forwarded to this function,
// so we mount BOTH /api/... (for direct calls) and /... (for serverless)
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/lend-borrow',  require('./routes/lendBorrow'));
app.use('/api/webhook',      require('./routes/webhook'));
// Vercel strips the /api prefix before forwarding — mount without prefix too
app.use('/auth',         require('./routes/auth'));
app.use('/transactions', require('./routes/transactions'));
app.use('/lend-borrow',  require('./routes/lendBorrow'));
app.use('/webhook',      require('./routes/webhook'));

// ── Budget Routes (inline) ──
app.get('/api/budget', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    let budget = await Budget.findOne({ user: req.user._id, month });
    if (!budget) budget = await Budget.create({ user: req.user._id, month, totalBudget: req.user.monthlyBudget || 25000, categories: [] });
    res.json({ success: true, data: budget });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.put('/api/budget', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { ...req.body, user: req.user._id, month },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: budget });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── Savings Goals Routes ──
app.get('/api/goals',     auth, async (req, res) => { try { res.json({ success: true, data: await SavingsGoal.find({ user: req.user._id }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });
app.post('/api/goals',    auth, async (req, res) => { try { res.status(201).json({ success: true, data: await SavingsGoal.create({ ...req.body, user: req.user._id }) }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } });
app.put('/api/goals/:id', auth, async (req, res) => { try { res.json({ success: true, data: await SavingsGoal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }) }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } });
app.delete('/api/goals/:id', auth, async (req, res) => { try { await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id }); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });

// ── Recurring Routes ──
app.get('/api/recurring',     auth, async (req, res) => { try { res.json({ success: true, data: await Recurring.find({ user: req.user._id }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });
app.post('/api/recurring',    auth, async (req, res) => { try { res.status(201).json({ success: true, data: await Recurring.create({ ...req.body, user: req.user._id }) }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } });
app.put('/api/recurring/:id', auth, async (req, res) => { try { res.json({ success: true, data: await Recurring.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }) }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } });
app.delete('/api/recurring/:id', auth, async (req, res) => { try { await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user._id }); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });

// ── Reminders Routes ──
app.get('/api/reminders',     auth, async (req, res) => { try { res.json({ success: true, data: await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });
app.put('/api/reminders/:id', auth, async (req, res) => { try { res.json({ success: true, data: await Reminder.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }) }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } });
app.delete('/api/reminders/:id', auth, async (req, res) => { try { await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id }); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });

// ── 404 ──
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` }));

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Smart Kharcha API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
}

module.exports = app;
