var http = require('http');
var express = require('express');
var app = express();
var credentials = require('./credentials.js');
var mongoose = require('mongoose');
var record = require('./handlers/record.js');

// 模版引擎
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        // 段落 可以从视图传递数据到布局{{body}}区以外的地方
        section: function (name, options) {
            if (!this._sections) {
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        },
        // 资源重定位
        static: function (name) {
            return require('./lib/static.js').mapping(name);
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3001);

// 连接本地数据库
mongoose.connect('mongodb://localhost/test');

// define a schema
var personSchema = mongoose.Schema({
    name: {
        first: String,
        last: String
    }
});

// 关系 数据库db > 数据表collection > 文档 {}

// compile our model 相当于创建了一个数据表
var Person = mongoose.model('Person', personSchema);

// create a document
var axl = new Person({
    name: { first: 'xu', last: 'zhongyuan' }
});

// save
axl.save(function (err, item) {
    if (err) {
        console.log(err)
    } else {
        console.log(item)
    }
});

// 查询person数据表的信息
Person.find(function(err, items){
    console.log(items)
})






app.get('/', function (req, res) {
    res.render('home')
})

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port'));
});