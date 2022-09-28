const Router = require('express');
const router = new Router();

const deviceController = require('../controllers/deviceController');

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getOne);

router.post('/', deviceController.create);

router.put('/:id/available', deviceController.updateAvailable);
router.put('/:id/update-price', deviceController.updatePrice);

router.delete('/:id', deviceController.remove);

module.exports = router;
