'use strict';

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var bodyParser = require('body-parser');
var errorhandler = require('./middlewares/errorhandler.js');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var webRouter = require('./web_router.js');
var setupsocket = require('./setupsocket.js');
var MongoStore = require('connect-mongo')(session);
var view = require('./middlewares/view.js');

mongoose.connect('mongodb://localhost/wahu');

mongoose.connection.on('error', function (err) {
    console.error(err)
});
mongoose.connection.once('open', function () {
    console.log('Open mongoDB success!');
});

app.use(compression());

app.use('/static', express.static(__dirname + '/static'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(session({
    secret: 'kuroguo',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ db: mongoose.connection.db })
}));

// app.use(function (req, res, next) {
//     setTimeout(function () {
//         next();
//     }, 3000);
// });

app.use('/api', webRouter);

app.use(view);

app.use(errorhandler);

setupsocket(io);

server.listen(process.env.PORT || 1337, function () {
    console.log('Listenning port ' + (process.env.PORT || 1337) + '.');
});
