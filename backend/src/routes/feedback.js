const router = require('express').Router();
const { submit } = require('../controllers/feedbackController');

router.post('/', submit);

module.exports = router;
