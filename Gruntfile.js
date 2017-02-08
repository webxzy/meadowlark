module.exports = function(grunt) {
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
        'grunt-contrib-less',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-hashres'
    ].forEach(function(task) {
        grunt.loadNpmTasks(task);
    });

    grunt.initConfig({
        // 编译less
        less: {
            development: {
                options: {
                    customFunctions: {
                        // 资源重定位
                        static: function(lessObject, name) {
                            return 'url("' + require('./lib/static.js').mapping(name.value) + '")';
                        }
                    }
                },
                files: { 
                    'public/css/main.css': 'less/main.less',
                    'public/css/cart.css': 'less/cart.less'
                }
            }
        },
        // 打包js
        uglify: {
            all: {
                files: {
                    'public/js/meadowlark.min.js': ['public/js/**/*.js']
                }
            }
        },
        // 打包和压缩css
        cssmin: {
            combine: {
                files: {
                    'public/css/meadowlark.css': ['public/css/**/*.css', '!public/css/meadowlark*.css']
                }
            },
            minify: {
                src: 'public/css/meadowlark.css',
                dest: 'public/css/meadowlark.min.css'
            }
        },
        // 添加hash值
        hashres: {
            options: {
                fileNameFormat: '${name}.${hash}.${ext}'
            },
            all: {
                src: [
                    'public/js/meadowlark.min.js',
                    'public/css/meadowlark.min.css',

                ],
                dest: [
                    // 'views/layouts/main.handlebars'
                    'config.js'
                ]
            }
        },
        // 测试
        cafemocha: {
            all: { src: 'qa/tests-*.js', options: { ui: 'tdd' } }
        },
        // 语法检查
        jshint: {
            app: [
                'meadowlark.js',
                // 'public/js/**/*.js',
                // 'lib/**/*.js'
            ],
            qa: [
                'Gruntfile.js',
                // 'public/qa/**/*.js',
                // 'qa/**/*.js'
            ]
        },
        // 启动项目
        exec: {
            serverStart: { cmd: 'node meadowlark.js' }
        }
    });

    grunt.registerTask('default', ['cafemocha', 'jshint']);
    grunt.registerTask('build', ['less', 'cssmin', 'uglify', 'hashres']);
};