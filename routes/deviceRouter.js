const Router = require('express');
const router = new Router();

const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getOne);

router.post('/', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.create);
router.post('/:deviceId/category', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.addCategory);
router.post('/category/:categoryId', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.addInfo);

router.put('/:id/available', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateAvailable);
router.put('/:id/update-price', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updatePrice);
router.put('/:id/add-discount', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.addDiscount);
router.put('/:id/update-discount', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateDiscount);
router.put('/:id/remove-discount', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeDiscount);
router.put('/category/:categoryId', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateCategoryTitle);

router.delete('/:id', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.remove);
router.delete('/category/:categoryId', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeCategory);
router.delete('/category/info/:infoId', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeInfo);

module.exports = router;
