// var Attraction = require('../models/attraction.js');

// 查找所有
/*exports.getAttractions = function(req, content, cb) {
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
}
*/
// 查找单项
/*exports.getAttraction = function(req, res) {
    Attraction.findById(req.params.id, function(err, item) {
        if (err) return cb({ error: '数据库错误' }) // res.send(500, '数据库错误');
        cb(null, {
            name: item.name,
            id: item._id,
            description: item.description,
            location: item.location
        });
    });
}
*/
// 添加一项view
exports.attraction = function(req, res) {
    res.render('attraction');
}

// 添加一项
/*exports.postAttraction = function(req, res) {
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
}*/