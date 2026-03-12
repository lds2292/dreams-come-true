const router = require('express').Router();
const backofficeAuth = require('../middleware/backofficeAuth');
const { login, createDream } = require('../controllers/backofficeController');

router.post('/login', login);
router.post('/dreams', backofficeAuth, createDream);

module.exports = router;
