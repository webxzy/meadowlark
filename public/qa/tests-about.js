suite('"About" Page Tests', function(){
	test('页面里有没有包含“关于我们”链接', function(){
		assert(document.querySelectorAll('a[href="/contact"]').length);
	})
})
