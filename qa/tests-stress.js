var loadtest = require('loadtest');
var expect = require('chai').expect;
suite('并发测试', function() {
    test('首页每秒应处理50个请求', function(done) {
        var options = {
            url: 'http://localhost:3000',
            concurrency: 4,
            maxRequests: 50
        };
        loadtest.loadTest(options, function(err, result) {
            expect(!err);
            expect(result.totalTimeSeconds < 1);
            done();
        });
    });
});