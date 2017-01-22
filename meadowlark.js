var express = require('express');
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weatherData');
var credentials = ('./credentials.js');
var formidable = require('formidable');
var nodemailer = require('nodemailer');
var app = express();
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        // 段落 可以从视图传递数据到布局的{{body}}区以外的地方
        section: function(name, options) {
            if (!this._sections) {
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

// 发送邮件
var transporter = nodemailer.createTransport('smtps://webxzy15@gmail.com:xu741023@smtp.gmail.com');

// 更多配置
/* var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'webxzy15@gmail.com',
        pass: 'xu741023'
    },
    logger: true,
    debug: true
}); */

var mailOptions = {
    from: '徐忠元 <webxzy15@gamil.com>',
    to: 'webxzy@qq.com',
    subject: 'Hello',
    text: 'You are great!',
    html: '<h1>You are great!</h1>'
}

transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
        return console.log('email 错误：' + err);
    }
    console.log('Message sent: ' + info.response);
});

// 中间件
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')()); // form表单
app.use(require('cookie-parser')(credentials.cookieSecret)); // cookie解析
app.use(require('express-session')({ // 内存会话
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// 即显消息 使用内存存储
app.use(function(req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// qa
app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

// 中间件 收到请求后自动触发 向req.locals添加一条属性
app.use(function(req, res, next) {
    if (!res.locals.partials) {
        res.locals.partials = {};
    }
    res.locals.partials.weather = weather.getWeatherData();
    next();
});

// 首页
app.get('/', function(req, res) {
    // req.session.userName = 'xzy';
    res.render('home');
});

app.get('/about', function(req, res) {
    console.log(req.cookies)

    // 设置一个cookie
    res.cookie('about', 'pass');

    // res.cookie('mytoken', '666', { signed: true }); 
    // 报错 cookieParser("secret") required for signed cookies
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

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
    res.render('jqueryTest');
});

// 一个假数据库程序
var NewsletterSignup = function() {};
NewsletterSignup.prototype.save = function(cb) { cb() };

// 订阅处理程序
app.post('/process', function(req, res) {
    var name = req.body.name || '',
        email = req.body.email || ''
        // 数据校验
    if (email.indexOf('@') === -1) {
        if (req.xhr) {
            return res.json({ error: '无效的 email address' });
        }
        req.session.flash = {
            type: 'danger',
            intro: '确认错误',
            message: '您输入的电子邮件地址无效'
        };
        return res.redirect(303, '/newsletter/archive');
    }

    // 存储到数据库
    new NewsletterSignup({ name: name, email: email }).save(function(err) {
        if (err) {
            if (req.xhr) {
                return res.json({ error: '数据库错误' });
            }
            req.session.flash = {
                type: 'danger',
                intro: '数据库错误',
                message: '数据库发生了一个未知错误，请稍后再试！'
            }
            return res.redirect(303, '/newsletter/archive');
        }
        if (req.xhr) {
            return res.json({ success: true });
        }
        req.session.flash = {
            type: 'success',
            intro: '谢谢',
            message: '你已经报名成功！'
        }
        return res.redirect(303, '/newsletter/archive');
    });
});

app.get('/newsletter', function(req, res) {
    res.render('newsletter');
});

app.get('/newsletter/archive', function(req, res) {
    res.render('newsletter/archive');
});

app.get('/thank-you', function(req, res) {
    res.render('thank-you', { name: req.query.name });
});

// 上传图片页面
app.get('/contest/vacation-photo', function(req, res) {
    var t = new Date();
    res.render('contest/vacation-photo', {
        year: t.getFullYear(),
        month: t.getMonth()
    });
});

// 上传图片处理程序
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) {
            return res.redirect(303, '/error');
        }
        console.log('收到 fields');
        console.log(fields);
        console.log('收到 files');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

// 404
app.use(function(req, res) {
    res.status(404).render('404');
});

// 500
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('500');
});

app.listen(app.get('port'), function() {
    console.log('express started on http://localhost:' + app.get('port'));
});