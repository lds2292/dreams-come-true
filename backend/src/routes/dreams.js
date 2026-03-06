const router = require('express').Router();
const { search } = require('../controllers/dreamsController');
const { daily }  = require('../controllers/dailyController');

router.get('/search', search);
router.get('/daily',  daily);

module.exports = router;
