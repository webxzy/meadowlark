var mongoose = require('mongoose');

var recordSchema = mongoose.Schema({
    text: String,
    time: String
});

var Record = mongoose.model('record', recordSchema);

module.exports = Record;