const Router = require('express');
const router = new Router();

const deviceController = require('../controllers/deviceController');

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getOne);

router.post('/', deviceController.create);
router.post('/:deviceId/category', deviceController.addCategory);
router.post('/category/:infoCategoryId', deviceController.addInfo);

router.put('/:id/available', deviceController.updateAvailable);
router.put('/:id/update-price', deviceController.updatePrice);
router.put('/:id/add-discount', deviceController.addDiscount);
router.put('/:id/update-discount', deviceController.updateDiscount);
router.put('/:id/remove-discount', deviceController.removeDiscount);
router.put('/category/:infoCategoryId', deviceController.updateCategoryTitle);

router.delete('/:id', deviceController.remove);
router.delete('/category/:infoCategoryId', deviceController.removeCategory);
router.delete('/category/info/:infoId', deviceController.removeInfo);

module.exports = router;
