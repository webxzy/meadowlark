// 上传图片页面
exports.vacationPhoto = function(req, res) {
    var t = new Date();
    res.render('contest/vacation-photo', {
        year: t.getFullYear(),
        month: t.getMonth()
    });
};

// 设置保存上传文件的目录
var dataDir = './data';
var vacationPhotoDir = dataDir + '/vacation-photo';
var fs = require('fs');
var formidable = require('formidable');

// 检测是否有对应目录，没有就创建一个
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath) {}

// 上传图片处理程序
exports.postVacationPhoto = function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) {
            req.session.flash = {
                type: 'danger',
                intro: '错误',
                message: '提交错误，请再试一次'
            }
            return res.redirect(303, '/contest/vacation-photo');
        }
        console.log('收到 fields');
        console.log(fields);
        console.log('收到 files');
        console.log(files);
        var photo = files.photo;
        // 建立一个唯一目录，防止冲突
        var dir = vacationPhotoDir + '/' + Date.now();
        var path = dir + '/' + photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir + '/' + photo.name);
        saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
        req.session.flash = {
            type: 'success',
            intro: 'Good luck!',
            message: '你保存了一个文件'
        }
        res.redirect(303, '/contest/vacation-photo/entries');
    });
};

exports.entries = function(req, res) {
    res.render('contest/vacation-photo/entries');
};