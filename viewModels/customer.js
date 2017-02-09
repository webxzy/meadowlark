/*
    视图模型
*/
// var Customer = require('../model/customer.js');
var _ = require('underscore');

// 用来可视化数据
function smartJoin(arr, separator) {
    if (!separator) separator = ' ';
    return arr.filter(function (elt) {
        return elt !== undefined &&
            elt !== null &&
            elt.toString().trim() !== '';
    }).join(separator);
}

// 使用插件
// 这一部分书上写的有问题 这里的代码是正确的 方法接收一个客户数据和一个订单列表
function getCustomerViewModel(customer, orders) {
    var vm = _.omit(customer, 'salesNotes');
    // 克隆数据 只返回必要展示的数据
    return _.extend(vm, {
        name: smartJoin([vm.firstName, vm.lastName]),
        fullAddress: smartJoin([
            customer.address1,
            customer.address2,
            customer.city + ', ' +
            customer.state + ' ' +
            customer.zip,
        ], '<br>'),
        orders: orders.map(function (order) {
            return {
                orderNumber: order.orderNumber,
                date: order.date,
                status: order.status,
                url: '/orders/' + order.orderNumber
            };
        })
    });
}

module.exports = getCustomerViewModel;

/*// 原始方法 有问题
module.exports = function (customerId) {
    var customer = Customer.findById(customerId);
    if (!customer) return {
        error: 'Unknown customer ID: ' +
        req.params.customerId
    };
    return {
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: smartJoin([customer.firstName, customer.lastName]),
        email: customer.email,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        fullAddress: smartJoin([
            customer.address1,
            customer.address2,
            customer.city + ', ' +
            customer.state + ' ' +
            customer.zip,
        ], '<br>'),
        phone: customer.phone,
        orders: customer.getOrders().map(function (order) {
            return {
                orderNumber: order.orderNumber,
                date: order.date,
                status: order.status,
                url: '/orders/' + order.orderNumber,
            }
        })
    }
}*/