exports.newsletter = function(req, res) {
    // 跨站请求伪造
    res.locals._csrfToken = req.csrfToken();
    res.render('newsletter');
};

// 虚拟数据库程序
var NewsletterSignup = function() {};
NewsletterSignup.prototype.save = function(cb) { cb() };

// 订阅处理程序
exports.process = function(req, res) {
    var name = req.body.name || '',
        email = req.body.email || ''
        // 数据校验
    if (email.indexOf('@') === -1) {
        if (req.xhr) {
            return res.json({ error: '无效的 email address' });
        }
        req.session.flash = {
            type: 'danger',
            intro: '邮箱错误',
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
            message: '你已经订阅成功！'
        }
        return res.redirect(303, '/newsletter/archive');
    });
};

// 订阅成功的提示页
exports.archive = function(req, res) {
    res.render('newsletter/archive');
};