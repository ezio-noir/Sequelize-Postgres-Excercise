const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const detailsController = require('../controllers/detailsController');
const db = require('../models');

// Fetch data for layout
router.use(async (req, res, next) => {
  const Category = db.Category;
  const Blog = db.Blog;
  const Tag = db.Tag;

  const layoutCategories = await Blog.findAll({
    attributes: [
      'categoryId',
      [db.sequelize.fn('COUNT', db.sequelize.col('categoryId')), 'blogCount'],
      [db.sequelize.col('Category.name'), 'name']
    ],
    include: [
      { model: Category, attributes: [] }
    ],
    group: ['categoryId', 'Category.name']
  });
  const layoutTags = await Tag.findAll();

  res.locals.layoutCategories = layoutCategories;
  res.locals.layoutTags = layoutTags;
  next();
});

router.get('/', indexController.show);
router.get('/blogs', indexController.show);
router.get('/blogs/:id', detailsController.show);

module.exports = router;