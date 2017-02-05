var nodemailer = require('nodemailer');
module.exports = function(credentials) {

    var mailTransport = nodemailer.createTransport('smtps://' + credentials.mail.name + '@gmail.com:' + credentials.mail.password + '@smtp.gmail.com');

    // 更多配置
    /*var mailTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: credentials.mail.name,
            pass: credentials.mail.password
        },
        logger: true,
        debug: true
    });*/

    // 示例
    /*var mailOptions = {
        from: '徐忠元 <webxzy15@gamil.com>',
        to: 'webxzy@qq.com',
        subject: '程序启动提示',
        text: 'You are great!',
        html: '<h1>程序已启动！</h1>'
    }*/

    /*mailTransport.sendMail(mailOptions, function(err, info) {
        if (err) {
            return console.log('email 错误：' + err);
        }
        console.log('Message sent: ' + info.response);
    });*/

    var from = '徐忠元 <webxzy15@gmail.com>',
        errorRecipient = 'webxzy@qq.com';

    return {
        send: function(to, subj, body) {
            mailTransport.sendMail({
                from: from,
                to: to,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function(err, info) {
                if (err) {
                    return console.error('邮件错误：' + err.stack);
                }
                console.log('email send：' + info.response);
            });
        },
        sendError: function(message, filename, exception) {
            var body = '<h1>网站错误</h1>信息: <br><pre>' + message + '</pre><br>';
            if (exception) body += '例外：<br><pre>' + exception + '</pre><br>';
            if (filename) body += '文件名：<br><pre>' + filename + '</pre><br>';
            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: '网站错误',
                html: body,
                generateTextFromHtml: true
            }, function(err, info) {
                if (err) {
                    console.error('邮件错误：' + err.stack);
                }
                console.log('email send：' + info.response);
            });
        }
    };
}