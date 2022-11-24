const Router = require('express');
const router = new Router();

const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getOne);

router.post('/', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.create);
router.post('/category', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.createCategory);
router.post('/category/info', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.createInfo);

router.put('/update', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.update);
router.put('/category', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.updateCategoryTitle);
router.put('/category/info', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.updateInfo);

router.delete('/category', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.removeCategory);
router.delete('/category/info', authMiddleware, checkRoleMiddleware('MANAGER'), deviceController.removeInfo);

module.exports = router;
