var http = require('http');
var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weatherData');
var credentials = require('./credentials.js');
var emailService = require('./lib/email.js')(credentials);
var nodemailer = require('nodemailer');
var fs = require('fs');
var mongoose = require('mongoose');
var cors = require('cors');
var vhost = require('vhost');

// 数据库模式模型
var Cart = require('./models/cart.js');

// 模版引擎
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        // 段落 可以从视图传递数据到布局{{body}}区以外的地方
        section: function(name, options) {
            if (!this._sections) {
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        },
        // 资源重定位
        static: function(name) {
            return require('./lib/static.js').mapping(name);
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

// 指定为生产环境
// app.set('env', 'production');

// 根据开发环境自动切换未打包或已打包的js和css文件
var bundler = require('connect-bundle')(require('./config.js'));
app.use(bundler);

// 开发环境用彩色logging，生产环境用普通logging
switch (app.get('env')) {
    case 'development':
        app.use(require('morgan')('dev'));
        
        // 线上数据库
        // mongoose.connect(credentials.mongo.development.connectionString);

        // 本地数据库
        mongoose.connect('mongodb://localhost/meadowlark_dev');
        break;
    case 'production':
        app.use(require('express-logger')({
            path: __dirname + '/log/requires.log'
        }));

        // 线上数据库
        // mongoose.connect(credentials.mongo.development.connectionString);

        // 本地数据库
        mongoose.connect('mongodb://localhost/meadowlark');
        break;
    default:
        // throw new Error('未知的执行环境: ' + app.get('env'));
}

// 使用MongoDB存储会话数据
var MongoSessionStore = require('session-mongoose')(require('connect'));

// var sessionStore = new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });
var sessionStore = new MongoSessionStore({ url: 'mongodb://localhost/meadowlark_dev' });

// 使用域捕获异常 必须放在所有中间件和路由前面
app.use(function(req, res, next) {
    var domain = require('domain').create();
    domain.on('error', function(err) {
        console.error('DOMAIN ERROR GAUGHT\n', err.stack);
        try {
            // 在5秒内进行故障保护关机
            setTimeout(function() {
                console.error('安全关机');
                process.exit(1);
            }, 5000);

            // 从集群中断开
            var worker = require('cluster').worker;
            if (worker) worker.disconnect();

            // 停止接收新请求
            server.close();

            try {
                // 尝试使用express错误路由
                next(err);
            } catch (error) {
                // 使用原生node API响应客户端
                console.error('Express 错误机制失败\n', err.stack);
                res.statusCode = 500;
                res.setHeader('Content-type', 'text/plain');
                res.end('服务器错误');
            }

        } catch (err) {
            console.error('Unable to send 500 response.\n', err.stack);
        }
    });
    // 向域中添加请求和响应对象
    domain.add(req);
    domain.add(res);

    // 执行该域中剩余的请求链
    domain.run(next);
});

// 中间件
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')()); // form表单
app.use(require('cookie-parser')(credentials.cookieSecret)); // cookie解析

// 使用内存存储会话数据 只能在开发环境使用
/*app.use(require('express-session')({ // 内存会话
    secret: credentials.cookieSecret, // 与cookie-parser保持一致
    resave: true,
    saveUninitialized: true
}));*/

// 使用MongoDB存储会话数据
app.use(require('express-session')({ store: sessionStore }));

// 跨域
app.use('/api', cors());

// qa
app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

// 即显消息 使用内存存储
app.use(function(req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// 导航高亮
app.use(function(req, res, next) {
    res.locals.nav = {};

    /*// 正式网站可以使用这种方式
    var ps = req.path.replace(/\//g, '');
    console.log(ps);
    if(ps) {
        res.locals.nav[ps] = 'active';
    } else {
        res.locals.nav.home = 'active';
    }*/
    
    switch (req.path) {
        case '/record':
            res.locals.nav.record = 'active';
            break;
        case '/vacations':
            res.locals.nav.tour = 'active';
            break;
        case '/newsletter':
            res.locals.nav.newsletter = 'active';
            break;
        case '/contest/vacation-photo':
            res.locals.nav.vacationPhoto = 'active';
            break;
        case '/about':
            res.locals.nav.about = 'active';
            break;
        case '/attraction':
            res.locals.nav.attraction = 'active';
            break;
        default:
            res.locals.nav.home = 'active';
    }

    next();
});

// session test
app.get('/session', function(req, res) {
    if (req.session.name) {
        console.log(req.session.name);
    }
    req.session.name = 'a';
    res.send('a');
});

// 向req.locals添加一条属性天气预报
app.use(function(req, res, next) {
    if (!res.locals.partials) {
        res.locals.partials = {};
    }
    res.locals.partials.weather = weather.getWeatherData();
    next();
});

// 查看处理请求的工作线程id
app.use(function(req, res, next) {
    var cluster = require('cluster');
    if (cluster.isWorker) {
        console.log('Worker %d received request', cluster.worker.id);
    }
    next();
});

// 博客 blog.localhost:3000 一般的二级域名需要放到前面
var blog = express.Router();
var api = express.Router();
app.use(vhost('blog.*', blog));
app.use(vhost('api.*', api));

blog.get('/', function(req, res) {
    res.render('blog/home', { layout: null });
});

api.get('/attraction', function(req, res) {
    res.render('api/attraction');
});

// 首页
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/about', function(req, res) {
    // console.log(req.cookies); // 获取普通cookie
    // console.log(req.signedCookies); // 获取签名cookie

    // 设置一个cookie
    res.cookie('about', 'pass');
    // 设置一个普通cookie
    res.cookie('webxzy-token', '666', { signed: true });

    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

require('./routes')(app);

/*app.get('/fail', function(req, res) {
    process.nextTick(function() {
        throw new Error('kaboom!');
    })
});*/

app.get('/clear-cookie', function(req, res) {
    console.log(req.query.n);
    if (!req.query.n) {
        return res.send('请在URL输入需要清除的cookie');
    }
    res.clearCookie(req.query.n);
    res.send('cookie“' + req.query.n + '”已被清除');
});

app.get('/tours/hood-river', function(req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res) {
    res.render('tours/request-group-rate', {
        referrer: req.headers.referer
    });
});

app.get('/tours/oregon-coast', function(req, res) {
    res.render('tours/oregon-coast');
});

// 查看请求头信息
app.get('/headers', function(req, res) {
    res.set('Content-Type', 'text/plain');
    var headers = '';
    for (var attr in req.headers) {
        headers += attr + ': ' + req.headers[attr] + '\n';
    }
    res.send(headers);
});

app.get('/jq-test', function(req, res) {
    res.render('jquery-test');
});

/*app.get('/thank-you', function(req, res) {
    res.render('thank-you', { name: req.query.name });
});*/

// --------------- 购物车 ---------------------

// 编辑界面
app.get('/tours/:tour', function(req, res) {
    var name = '';
    switch (req.params.tour) {
        case 'bj':
            name = '北京';
            break;
        case 'tj':
            name = '天津';
            break;
        default:
            name = null;
    }
    res.render('tour', { tour: { name: name, tag: req.params.tour } });
});

// 添加订单
app.post('/cart/add', function(req, res) {
    var cart = req.session.cart || (req.session.cart = { items: [] });
    var items = cart.items;
    var name = req.body.name;
    // 如果是已经存在的，直接修改数量
    for (var i = 0; i < items.length; i++) {
        if (items[i].name === name) {
            items[i].guests = req.body.guests;
            return res.redirect(303, '/cart');
        }
    }
    cart.items.push({
        tag: req.body.tag,
        name: req.body.name,
        guests: req.body.guests
    });
    res.redirect(303, '/cart');
});

app.get('/cart/delete-cart/:tag', function(req, res, next) {
    var items = req.session.cart.items;
    if (!items) next();
    var tag = req.params.tag
    for (var i = 0; i < items.length; i++) {
        if (items[i].tag === tag) {
            items.splice(i, 1);
            return res.render('cart', { items: items });
        }
    }
});

// 购物列表
app.get('/cart', function(req, res, next) {
    var cart = req.session.cart;
    if (!cart) {
        console.log('cart is empty!');
        next();
    }
    res.render('cart', { items: cart.items });
});

// 提交购物页
app.get('/cart/checkout', function(req, res, next) {
    var cart = req.session.cart;
    if (!cart) next();

    // 显示已经订阅者
    Cart.find(function(err, carts) {
        res.render('cart-checkout', { carts: carts });
    });
});

// 提交购物
app.post('/cart/chcekout', function(req, res, next) {
    var cart = req.session.cart;

    if (!cart) {
        next(new Error('Cart does not exist.'));
    }

    var name = req.body.name,
        email = req.body.email;

    if (email.indexOf('@') === -1) {
        return next(new Error('邮箱格式错误'));
    }
    cart.number = Math.random().toString().replace(/^0\.0*/, '');
    cart.billing = {
        name: name,
        email: email
    };

    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    new Cart({ name: name, email: email, time: time }).save(function(err) {
        if (err) {
            req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: '数据库错误！'
            }
            return res.redirect(303, '/cart/checkout');
        }

        // render接收的第三个参数是个回调函数，函数接收渲染好的html，再执行相关操作，这样就不会渲染到浏览器端。
        res.render('email/cart-thank-you', { layout: null, cart: cart }, function(err, html) {
            if (err) {
                console.log('email模版错误');
                return next(err);
            }
            emailService.send(email, 'webxzy订单提醒', html);
            res.redirect(303, '/cart-thankyou');
        });
    });
});

app.get('/cart-thankyou', function(req, res, next) {
    var cart = req.session.cart;
    if (!cart) return next();
    res.render('cart-thankyou', { cart: cart });
});

// ------------------ REST ---------------------------
var Attraction = require('./models/attraction.js');
var rest = require('connect-rest');

// 以下请求都是通过 api.localhost:3000/attractions 来访问
rest.get('/attractions', function(req, content, cb) {
    Attraction.find({ approved: false }, function(err, attractions) {
        if (err) return cb({ error: '数据库错误' }) //res.send(500, '数据库错误');
        cb(null, attractions.map(function(item) {
            return {
                name: item.name,
                id: item._id,
                description: item.description,
                location: item.location
            }
        }));
    });
});

rest.post('/add-attraction', function(req, content, cb) {
    var item = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date()
        },
        approved: false
    });

    item.save(function(err, attraction) {
        if (err) return cb({ error: '数据库错误' }) // res.send(500, '数据库错误');
        cb(null, { id: attraction._id });
    });
});

rest.get('/attraction/:id', function(req, content, cb) {
    Attraction.findById(req.params.id, function(err, item) {
        if (err) return cb({ error: '数据库错误' }) // res.send(500, '数据库错误');
        cb(null, {
            name: item.name,
            id: item._id,
            description: item.description,
            location: item.location
        });
    });
});

var apiOptions = {
    context: '/', // 如果这里不用子域名，而是通过域名后路径访问，就要填 '/api',
    domain: require('domain').create()
}

// 使用子域访问 api.localhost/attractions
app.use(vhost('api.*', rest.rester(apiOptions)));

// 使用域 + 路由访问上面的路由 localhost/attractions
// app.use(rest.rester(apiOptions));

/*apiOptions.domain.on('error', function(err) {
    console.log('API domain error.\n', err.stack);
    setTimeout(function() {
        console.log('Server shutting down after API domain error.');
        process.exit(1);
    }, 5000);
    server.close();
    var worker = require('cluster').worker;
    if (worker) worker.disconnect();
});*/

// 自动视图 (上面都匹配不到，会自动进入views寻找，比较适合简单页面展示)
/*var autoViews = {};
app.use(function(req, res, next) {
    var path = req.path.toLocaleLowerCase();
    if (autoViews[path]) {
        return res.render(autoViews[path]);
    }
    if (fs.existsSync(__dirname + '/views' + path + '.handlebars')) {
        autoViews[path] = path.replace(/^\//, '');
        return res.render(autoViews[path]);
    }
    next();
});*/

// 404
app.use(function(req, res) {
    res.status(404).render('404');
});

// 500
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).render('500', { info: err });
});

/*app.listen(app.get('port'), function() {
    console.log('express started on http://localhost:' + app.get('port'));
});*/

function startServer() {
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port'));
    });
}

if (require.main === module) {
    // 应用程序直接运行；启动应用服务器
    startServer();
} else {
    // 应用程序作为一个模块通过"require" 引入: 导出函数
    // 创建服务器
    module.exports = startServer;
}