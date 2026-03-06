const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { search }   = require('../controllers/dreamsController');
const { daily }    = require('../controllers/dailyController');
const { category } = require('../controllers/categoryController');

// 카테고리 API: IP당 분당 20회 제한
const categoryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
  handler: (req, res, next, options) => {
    console.warn(`[Rate Limit] IP=${req.ip}, url=${req.originalUrl}`);
    res.status(429).json(options.message);
  },
});

router.get('/search',   search);
router.get('/daily',    daily);
router.get('/category', categoryLimiter, category);

module.exports = router;
