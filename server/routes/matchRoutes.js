const router = require('express').Router();
const c = require('../controllers/studentController');

router.get('/:id', c.matches);

module.exports = router;
