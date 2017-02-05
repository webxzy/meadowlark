var Vacation = require('../models/vacation.js');
var VacationInSeasonListener = require('../models/vacationInSeasonListener.js');

// 初始化数据库
Vacation.find(function(err, vacations) {
    // find方法会查找数据库中所有vacation实例，并将返回结果列表传给回调函数并调用
    // console.log(vacations);
    if (vacations.length) return;

    // 实体 添加一些数据 后续封装一个方法
    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and enjoying craft beers in Hood River!',
        priceInCents: 9995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        priceInCents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of climbing in the high desert.',
        priceInCents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
        inSeason: true,
        requiresWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});

var convertFromUSD = function(val, currency) {
    switch (currency) {
        case 'USD':
            return val * 1;
        case 'GBP':
            return val * 0.6;
        case 'RMB':
            return val * 6.6;
        default:
            return NaN;
    }
}

exports.vacations = function(req, res) {
    Vacation.find({ available: true }, function(err, vacations) {
        var currency = req.session.currency || 'USD';
        var context = {
            vacations: vacations.map(function(vacation) {
                // 只暴露需要展示的数据
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: convertFromUSD(vacation.priceInCents / 100, currency),
                    inSeason: vacation.inSeason,
                    packagesSold: vacation.packagesSold
                }
            })
        };
        switch (currency) {
            case 'USD':
                context.currencyUSD = 'selected';
                break;
            case 'GBP':
                context.currencyGBP = 'selected';
                break;
            case 'RMB':
                context.currencyRMB = 'selected';
                break;
        }
        res.render('vacations', context);
    });
}

exports.buyNow = function(req, res) {
    var sku = req.query.sku;

    Vacation.findOne({ sku: sku }, function(err, item) {
        if (err) {
            console.log(err.stack);
            req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: '数据库错误'
            }
            return res.redirect(303, '/vacations');
        }
        Vacation.update({ sku: sku }, { packagesSold: item.packagesSold + 1 }, function(err) {
            if (err) {
                console.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: '数据库更新错误'
                }
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: '购买成功',
                message: '订单信息稍后会发送到您的邮箱'
            }
            res.redirect(303, '/vacations');
        });
    });
}

exports.getNotifyMeWhenInSeason = function(req, res) {
    res.render('notify-me-when-in-season', { sku: req.query.sku });
}

exports.postNotifyMeWhenInSeason = function(req, res) {
    VacationInSeasonListener.update({ email: req.body.email }, { $push: { skus: req.body.sku } }, { upsert: true },
        function(err) {
            if (err) {
                console.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: '数据库存储出现错误'
                }
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: '谢谢',
                message: '你会在应季的时候收到邮件通知'
            }
            res.redirect(303, '/vacations');
        }
    )
}

exports.setCurrency = function(req, res) {
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');
}