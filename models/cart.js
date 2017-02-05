var mongoose = require('mongoose');

var cartSchema = mongoose.Schema({
    email: String,
    name: String,
    time: String
});

var cart = mongoose.model('cart', cartSchema);

module.exports = cart;