const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const { Edge } = require('edge.js');
const iconify = require('edge-iconify');
const heroIcons = require('@iconify-json/heroicons').icons;
//TODO: Use connect-mongo for session storage

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
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'amogus'
}))
app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

// Setup Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Setup Routes
const indexRouter = require('./routes/index');
const ordersRouter = require('./routes/order'); 
app.use('/', indexRouter);
app.use('/order', ordersRouter);

// Setup Error Handlers
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

module.exports = app;
