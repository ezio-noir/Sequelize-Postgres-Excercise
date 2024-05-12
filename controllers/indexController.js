const db = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

const PAGE_LIMIT = 6;

const controller = {};

controller.show = async (req, res) => {
  const category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
  const tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
  const keyword = req.query.keyword || '';
  const page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page));

  const options = {
    attributes: [
      'id',
      'title',
      'description',
      'imagePath',
      'summary',
      'createdAt'
    ],
    where: {},
  };
  if (category > 0) {
    options.where.categoryId = category;
  }
  if (tag > 0) {
    options.include = [{
      model: db.Tag,
      where: { id: tag }
    }];
  }
  if (keyword.trim() !== '') {
    console.log(keyword?.trim());
    options.where.title = {
      [Op.iLike]: `%${keyword}%`
    }
  }
  options.limit = PAGE_LIMIT;
  options.offset = PAGE_LIMIT * (page - 1);

  const { rows, count } = await db.Blog.findAndCountAll(options);
  const commentCount = await db.Comment.findAll({
    attributes: [
      'blogId',
      [db.sequelize.fn('COUNT', db.sequelize.col('blogId')), 'blogCount'],
    ],
    group: ['blogId']
  });
  res.locals.commentCount = commentCount;

  blogsWithCommentCount = rows.map(row => {
    const blogCommentCount = commentCount.find(item => item.blogId === row.id);
    return {
      ...row.toJSON(),
      commentCount: blogCommentCount ? parseInt(blogCommentCount.dataValues.blogCount) : 0
    };
  });

  res.locals.title = `
    <div class="col-lg-12 text-center">
      <div class="breadcrumb__text">
          <h2>Blogs</h2>
          <div class="breadcrumb__option">
              <a href="/">Home</a>
              <span>Blog</span>
          </div>
      </div>
    </div>`
  res.locals.pagination = {
    page: page,
    limit: PAGE_LIMIT,
    totalRows: count,
    queryParams: req.query,
  };
  res.render('index', { blogs: blogsWithCommentCount });
};

module.exports = controller;