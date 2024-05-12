const db = require('../models');

const controller = {};

controller.show = async (req, res) => {
  if (isNaN(req.params.id)) {
    return res.redirect('/not_found');
  }
  const blogId = req.params.id;
  const blog = await db.Blog.findByPk(blogId);
  if (!blog) {
    return res.redirect('/not_found');
  }

  const authorId = blog.authorId;
  const categoryId = blog.categoryId;

  const authorPromise = db.User.findByPk(authorId);
  const categoryPromise = db.Category.findByPk(categoryId);
  const tagsPromise = db.Tag.findAll({
    include: [{
      model: db.Blog,
      where: { id: blogId }
    }]
  });
  const commentCountPromise = db.Comment.count({
    where: { blogId: blogId }
  });
  const [author, category, tags, commentsCount] = await Promise.all([authorPromise, categoryPromise, tagsPromise, commentCountPromise]);

  res.locals.title = `
    <div class="col-lg-12">
      <div class="blog__details__hero__text">
          <h2>${blog.title}</h2>
          <ul>
              <li>By ${author.firstName} ${author.lastName}</li>
              <li>${(new Date(blog.createdAt)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
              <li>${commentsCount} Comments</li>
          </ul>
      </div>
    </div>
  `;
  res.render('details', { blog, author, category, tags });
}

module.exports = controller;