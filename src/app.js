require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const { Edge } = require('edge.js');
const iconify = require('edge-iconify');
const heroIcons = require('@iconify-json/heroicons').icons;
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');



// Setup Database Connection
mongoose.connect('mongodb://localhost:27017/orders');
mongoose.connection.once('open', () => {
    console.log('Connected to Database!');
});
mongoose.connection.on("error", (err) => {
    console.error(`Database Connection Error: ${err}`);
});

// Setup Express
const app = express();

// Setup edge for the view engine
const edge = Edge.create({cache: process.env.NODE_ENV !== 'development'});
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
    secret: process.env.COOKIE_SECRET,
    cookie: {maxAge: new Date(253402300000000)}, // Never Expire
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: 'orders'
    })
}));
app.use(logger('dev'));
app.use(express.json());

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
