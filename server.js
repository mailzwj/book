var express = require('express')
    , cfg = require("./config")
    , http = require('http')
    , path = require('path')
    , MongoStore = require('connect-mongo')(express)
    , rootDir = require('./routes/rootdir').rootDir;

var app = express();

app.configure('development', function(){
    // 启用本地数据库
    cfg.start(true);
    app.use(express.errorHandler());
    console.log('development');
});

app.configure('production', function(){
    // 启用远程数据库
    cfg.start();
    console.log('production');
});


app.configure(function(){
    app.set('port', process.env.PORT || cfg.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "keyboard cat",
        store: new MongoStore({
          url: cfg.dburl
        })
    }));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

/********** web路由 **********/
var routes = require('./routes');
var urlArr = [
    '',
    '/addbook',
    '/savebook',
    '/apply/:isbn',
    '/manage',
    '/check_borrow',
    '/myborrow',
    '/cancelborrow',
    '/returnbook',
    '/updatebook',
    '/check_return',
    '/editbook',
    '/delbook',
    '/detail/:isbn',
    '/savecomment'
];
var routeArr = [
    'index',
    'addbook',
    'savebook',
    'apply',
    'manage',
    'checkborrow',
    'myborrow',
    'cancelborrow',
    'returnbook',
    'updatebook',
    'checkreturn',
    'editbook',
    'delbook',
    'detail',
    'savecomment'
];

urlArr.forEach(function (v, i) {
    app.all('/' + rootDir + v, routes.login, routes[routeArr[i]]);
});


/********** 移动路由 **********//*
<<<<<<< HEAD
var m = require("./routes/mobile");
app.all("/book/login", m.mlogin);
app.all("/book/mindex", m.mindex);
app.all("/book/scanborrow", m.scanborrow);
app.all("/book/mdetail", m.mdetail);
app.all("/book/madd", m.madd);
=======*/
var mRoutes = require("./routes/mobile");
var mUrlArr = [
    '/login',
    '/mindex',
    '/scanborrow',
    '/mdetail',
    '/madd',
    '/mreturn'

];
var mRouteArr = [
    'mlogin',
    'mindex',
    'scanborrow',
    'mdetail',
    'madd',
    'mreturn'
];

mUrlArr.forEach(function (v, i) {
    app.all('/' + rootDir + v, /*routes.login, */mRoutes[mRouteArr[i]]);
});


// >>>>>>> 95ebc7f0ec1c2b59d508afe6825a71e3095473c3

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
