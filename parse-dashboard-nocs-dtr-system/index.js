var express = require('express');
var ParseDashboard = require('parse-dashboard');

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/api",
      "appId": "nocsIntern",
      "masterKey": "nocsMaster",
      "appName": "NOCS DTR System"
    }
  ]
});

var app = express();

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

var httpServer = require('http').createServer(app);
httpServer.listen(4040);
console.log("Parse Dashboard is now running at http://localhost:4040/dashboard");

module.exports = {app, }