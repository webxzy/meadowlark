/*
    连接模型和模型视图
*/

var Customer = require('../models/customer.js');
var customerViewModel = require('../viewModels/customer.js');

module.exports = {

    // 注册路由
    registerRoutes: function (app) {
        app.get('/customer/register', this.register);
        app.post('/customer/register', this.processRegister);

        app.get('/customer/:id', this.home);
        app.get('/customer/:id/preferences', this.preferences);
        app.get('/orders/:id', this.orders);

        app.post('/customer/:id/update', this.ajaxUpdate);
    },

    // 注册页
    register: function (req, res, next) {
        res.render('customer/register');
    },

    // 提交注册信息
    processRegister: function (req, res, next) {
        // TODO: back-end validation (safety)
        var c = new Customer({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
        });
        c.save(function (err) {
            if (err) return next(err);
            res.redirect(303, '/customer/' + c._id);
        });
    },

    // 获取详情
    home: function (req, res, next) {
        Customer.findById(req.params.id, function (err, customer) {
            if (err) return next(err);
            if (!customer) return next(); 	// pass this on to 404 handler
            customer.getOrders(function (err, orders) {
                if (err) return next(err);
                res.render('customer/home', customerViewModel(customer, orders));
            });
        });
    },

    preferences: function (req, res, next) {
        Customer.findById(req.params.id, function (err, customer) {
            if (err) return next(err);
            if (!customer) return next(); 	// pass this on to 404 handler
            customer.getOrders(function (err, orders) {
                if (err) return next(err);
                res.render('customer/preferences', customerViewModel(customer, orders));
            });
        });
    },

    // 订单
    orders: function (req, res, next) {
        Customer.findById(req.params.id, function (err, customer) {
            if (err) return next(err);
            if (!customer) return next(); 	// pass this on to 404 handler
            customer.getOrders(function (err, orders) {
                if (err) return next(err);
                res.render('customer/preferences', customerViewModel(customer, orders));
            });
        });
    },

    // 数据更新
    ajaxUpdate: function (req, res) {
        Customer.findById(req.params.id, function (err, customer) {
            if (err) return next(err);
            if (!customer) return next(); 	// pass this on to 404 handler
            if (req.body.firstName) {
                if (typeof req.body.firstName !== 'string' ||
                    req.body.firstName.trim() === '')
                    return res.json({ error: 'Invalid name.' });
                customer.firstName = req.body.firstName;
            }
            // and so on....
            customer.save(function (err) {
                return err ? res.json({ error: 'Unable to update customer.' }) : res.json({ success: true });
            });
        });
    },
};
