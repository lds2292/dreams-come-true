const router = require('express').Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes placeholder
// router.use('/auth', require('./auth'));

router.use('/dreams', require('./dreams'));
router.use('/categories', require('./categories'));
router.use('/feedback', require('./feedback'));
router.use('/backstage', require('./backoffice'));

module.exports = router;
