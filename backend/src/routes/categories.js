const router = require('express').Router();
const { getTree, getDreamsByCategory } = require('../controllers/categoriesController');

// GET /api/categories → 전체 트리 (대분류 + 소분류)
router.get('/', getTree);

// GET /api/categories/:slug/dreams?sub=animal&page=1&limit=20
router.get('/:slug/dreams', getDreamsByCategory);

module.exports = router;
