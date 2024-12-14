const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { Edge } = require('edge.js');
const iconify = require('edge-iconify');
const heroIcons = require('@iconify-json/heroicons').icons;

const app = express();

// Setup edge for the view engine
const edge = Edge.create({cache: false});
iconify.addCollection(heroIcons);
edge.use(iconify.edgeIconify);
edge.mount(app.settings.views)
app.engine('edge', async (path, options, callback) => {
    callback(null, await edge.render(path, options));
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'edge');

// Setup Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Routes
const indexRouter = require('./routes/index');
const ordersRouter = require('./routes/order'); 
app.use('/', indexRouter);
app.use('/order', ordersRouter);

app.get('/test', (req,res) => {
    res.render('test', {username: "test"});
});

// Setup Error Handlers
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

module.exports = app;
