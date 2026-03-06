const router = require('express').Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes placeholder
// router.use('/auth', require('./auth'));

router.use('/dreams', require('./dreams'));
router.use('/feedback', require('./feedback'));

module.exports = router;
