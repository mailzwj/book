var express = require('express')
    , cfg = require("./config")
    , http = require('http')
    , path = require('path')
    , _ = require('underscore')
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
var webRoute = {
    '': 'index',
    '/addbook': 'addbook',
    '/savebook': 'savebook',
    '/apply/:isbn': 'apply',
    '/manage': 'manage',
    '/check_borrow': 'checkborrow',
    '/myborrow': 'myborrow',
    '/cancelborrow': 'cancelborrow',
    '/returnbook': 'returnbook',
    '/updatebook': 'updatebook',
    '/check_return': 'checkreturn',
    '/editbook': 'editbook',
    '/delbook': 'delbook',
    '/detail/:isbn': 'detail',
    '/savecomment': 'savecomment'
};
_.each(webRoute, function (v, i) {
   app.all('/' + rootDir + i, routes.login, routes[v]);
});


/********** 移动路由 **********/
var mobileRoutes = require("./routes/mobile");
var mobileRoute = {
    '/login': 'mlogin',
    '/mindex': 'mindex',
    '/scanborrow': 'scanborrow',
    '/mdetail': 'mdetail',
    '/madd': 'madd',
    '/mreturn': 'mreturn'
};
_.each(mobileRoute, function (v, i) {
   app.all('/' + rootDir + i, /*routes.login,*/ mobileRoutes[v]);
});



http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
