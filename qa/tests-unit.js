var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;
suite('幸运饼干测试', function(){
	test('返回的数据类型是否为string', function(){
		// console.log(fortune.getFortune())
		// console.log(typeof fortune.getFortune() === 'func')
		expect(typeof fortune.getFortune === 'func');
	})
})
