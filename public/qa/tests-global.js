suite('Global Tests', function(){
    test('页面是否有一个有效的标题', function(){
        assert(document.title && document.title.match(/\s/)) && document.title.toUpperCase() !== 'TODO';
    })
})