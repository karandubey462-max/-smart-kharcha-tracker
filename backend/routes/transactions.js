const express = require('express');
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/transactionController');

const router = express.Router();
router.use(auth);

router.get('/',          ctrl.getAll);
router.get('/summary',   ctrl.summary);
router.get('/:id',       ctrl.getOne);
router.post('/',         ctrl.create);
router.post('/bulk',     ctrl.bulkCreate);
router.put('/:id',       ctrl.update);
router.delete('/:id',    ctrl.remove);

module.exports = router;
