var record = require('./handlers/record.js');
var vacation = require('./handlers/vacation.js');
var newsletter = require('./handlers/newsletter.js');
var vacationPhoto = require('./handlers/vacationPhoto.js');
var attraction = require('./handlers/attraction.js');

// 跨站请求伪造
var csrfProtection = require('csurf')({ cookie: true });

module.exports = function(app) {
    // 记事本
    app.get('/record', record.getRecord);
    app.get('/delete-record/:id', record.deleteRecord);
    app.post('/record', record.postRecord);

    // 旅行产品
    app.get('/vacations', vacation.vacations);
    app.get('/buy-now', vacation.buyNow);
    app.get('/notify-me-when-in-season', vacation.getNotifyMeWhenInSeason);
    app.get('/set-currency/:currency', vacation.setCurrency);
    app.post('/notify-me-when-in-season', vacation.postNotifyMeWhenInSeason);

    // 简报
    app.get('/newsletter', csrfProtection, newsletter.newsletter);
    app.post('/process', csrfProtection, newsletter.process);
    app.get('/newsletter/archive', newsletter.archive);

    // 上传图片
    app.get('/contest/vacation-photo', vacationPhoto.vacationPhoto);
    app.post('/contest/vacation-photo/:year/:month', vacationPhoto.postVacationPhoto);
    app.get('/contest/vacation-photo/entries', vacationPhoto.entries);

    // 热门地点 api
    // app.get('/attractions', attraction.getAttractions);
    // app.get('/attraction/:id', attraction.getAttraction);
    // app.get('/api/attraction', attraction.attraction);
    // app.post('/post-attraction', attraction.postAttraction);

}