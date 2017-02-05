var record = require('./handlers/record.js');
var vacation = require('./handlers/vacation.js');

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
}