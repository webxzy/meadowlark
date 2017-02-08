// 用来给handlebar模版引擎使用，给图片添加基准URL

var baseUrl = '';
exports.mapping = function(name) {
    return baseUrl + name;
}