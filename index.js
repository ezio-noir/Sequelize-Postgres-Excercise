const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const expressHbs = require('express-handlebars');
const { createPagination } = require('express-handlebars-paginate');

app.use(express.static(__dirname + '/html'));

app.engine('hbs', expressHbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
    helpers: {
      createPagination,
    }
}));

app.set('view engine', 'hbs');

const hbs = expressHbs.create({});
hbs.handlebars.registerHelper('formatDate', (date) => {
  return `${(new Date(date)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/indexRouter'));
app.get('/not_found', (req, res) => {
  res.send('Not found!');
})

// app.get('/createTables', (req, res) => {
//   let models = require('./models');
//   models.sequelize.sync()
//     .then(() => {
//       res.send('Tables created.');
//     })
// });

app.listen(port, () => console.log(`App listening on port ${port}`));