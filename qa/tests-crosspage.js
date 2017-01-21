var Browser = require('zombie'),
	assert = require('chai').assert;

var browser;

suite('跨页测试', function(){

	setup(function(){
		browser = new Browser();
	});

	test('引用页是否为 hood-river', function(done){
		var referrer = 'http://localhost:3000/tours/hood-river';
		browser.visit(referrer, function(){
			browser.clickLink('.requestGroupRate', function(){
				assert(browser.field('referrer').value === referrer);
				done();
			});
		});
	});

	test('引用页是否为 oregon-coast', function(done){
		var referrer = 'http://localhost:3000/tours/oregon-coast';
		browser.visit(referrer, function(){
			browser.clickLink('.requestGroupRate', function(){
				assert(browser.field('referrer').value === referrer);
				done();
			});
		});
	});

	test('直接访问 request-group-rate 页 referrer 值是否为空', function(done){
		browser.visit('http://localhost:3000/tours/request-group-rate', function(){
			assert(browser.field('referrer').value === '');
			done();
		});
	});

});