var mongoose = require('mongoose');

// 1.创建模式
var vacationSchema = mongoose.Schema({
    name: String,
    slug: String,
    category: String,
    sku: String,
    description: String,
    priceInCents: Number,
    tags: [String],
    inSeason: Boolean,
    available: Boolean,
    requiresWaiver: Boolean,
    maximumGuests: Number,
    notes: String,
    packagesSold: Number
});

// 2.添加方法
vacationSchema.methods.getDisplayPrice = function() {
    return '￥' + (this.priceInCents).toFixed(2);
};

// 3.创建模型
var Vacation = mongoose.model('Vacation', vacationSchema);

module.exports = Vacation;