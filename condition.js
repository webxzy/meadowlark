http.createServer(app).listen(app.get('port'), function() {
    console.log('Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.');
});