/*
 * 应用集群
 */

var cluster = require('cluster');

function startWorker() {
    // 用cluster.fork 为系统中的每个CPU 启动了一个工作线程
    var worker = cluster.fork();
    console.log('CLUSTER: 工作线程 %d 已经启动', worker.id);
}

if (cluster.isMaster) {
    // 第一次为true

    // 获取电脑cup个数，并且依次开启工作线程
    require('os').cpus().forEach(function() {
        startWorker();
    });

    // 记录所有断开的工作线程。如果工作线程断开了，它应该退出
    cluster.on('disconnect', function(worker) {
        console.log('CLUSTER: 工作线程 %d 从群集断开连接', worker.id);
    });

    // 监听工作线程的exit事件，重新繁衍死掉的工作线程
    cluster.on('exit', function(worker, code, signal) {
        console.log('CLUSTER: 工作线程 %d 死亡并退出代码 %d (%s)', worker.id, code, signal);
        startWorker();
    });
} else {
    // 在这个工作线程上启动我们的应用服务
    require('./meadowlark.js')();
}

/*
- 在这个JavaScript 执行时，它或者在主线程的上下文中（当用node meadowlark_cluster.js 直接运行它时）
或者在工作线程的上下文中（在Node 集群系统执行它时）
- 属性cluster.isMaster 和cluster.isWorker 决定了你运行在哪个上下文中。

*/