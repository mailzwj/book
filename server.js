var express = require('express')
    , cfg = require("./config")
    , http = require('http')
    , path = require('path')
    , MongoStore = require('connect-mongo')(express);

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

var routes = require('./routes');
app.all('/', routes.login, routes.index);
app.all('/addbook', routes.login, routes.addbook);
app.all('/savebook', routes.login, routes.savebook);
app.all('/updatebook', routes.login, routes.updatebook);
app.all("/apply/:isbn", routes.login, routes.apply);
app.all("/manage", routes.login, routes.manage);
app.all("/check_borrow", routes.login, routes.checkborrow);
app.all("/myborrow", routes.login, routes.myborrow);
app.all("/cancelborrow", routes.login, routes.cancelborrow);
//app.all("/pushreturn", routes.login, routes.pushreturn);
//app.all("/returnapply", routes.login, routes.returnapply);
app.all("/returnbook", routes.login, routes.returnbook);
app.all("/check_return", routes.login, routes.checkreturn);
app.all("/editbook", routes.login, routes.editbook);
app.all("/delbook", routes.login, routes.delbook);
app.all("/detail/:isbn", routes.login, routes.detail);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
