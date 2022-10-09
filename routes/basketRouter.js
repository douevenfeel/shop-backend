const Router = require('express');
const router = new Router();

const basketController = require('../controllers/basketController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, basketController.getBasket);

router.post('/', authMiddleware, basketController.addDevice);

router.put('/', authMiddleware,basketController.changeCount);
router.put('/selected',authMiddleware, basketController.changeSelected);

router.delete('/',authMiddleware, basketController.remove);

module.exports = router;
