var Records = require('../models/record.js');
module.exports = function(app) {
    app.get('/record', function(req, res) {
        Records.find(function(err, records) {
            if (err) {
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: '数据库错误！'
                }
                return res.render('record');
            }
            res.render('record', { list: records });
        });
    });

    app.post('/record', function(req, res) {
        var date = new Date();
        var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        new Records({
            text: req.body.text,
            time: time
        }).save(function(err) {
            if (err) {
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: '数据库错误！'
                }
                return res.redirect(303, 'record');
            }
            res.redirect(303, 'record');
        });
    });

    app.get('/delete-record/:id', function(req, res) {
        Records.findByIdAndRemove(req.params.id, function(err, item) {
            if (err) {
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: '数据库错误！'
                }
                return res.redirect(303, 'record');
            }
            // 如果路由不带上 "/" 会出问题
            res.redirect(303, '/record');
        });
    });
}