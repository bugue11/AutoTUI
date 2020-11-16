"use strict";

var httpServer = null;
global.confPath = process.argv.length > 2?process.argv[2]:__dirname + "/config.json";

async function startWebServer() {
    let express = require('express');
	let app = express();
	let bodyParser = require('body-parser');
	let zServer = require("./z-server");
    let http = require('http');
    var CronJob = require('cron').CronJob;
    let moment = require('moment-timezone');
    let fs = require('file-system')
    const log = require('simple-node-logger').createSimpleFileLogger('logs/sistema/'+moment().format('MM-DD-YYYY')+'.log');
    
    var conf = require("./services/Config").Config.instance.getSync();
    let seg = require("./services/Seguridad").Seguridad.instance;
    let uv = require("./services/Autoprestamouv").Autoprestamouv.instance;

    zServer.registerModule("seg", seg);
    zServer.registerModule("uv", uv);

    app.use("/", express.static(__dirname + "/www"));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        next();
    });

    app.post("/*.*", function(req, res) {
		zServer.resolve(req, res);
    });
        
    if (conf.httpServer) {
        var port = conf.httpServer.port;
        httpServer = http.createServer(app);
       

        httpServer.listen(port, function () {
            console.log("[AutoTUI] HTTP Server started on port " + port)
            log.info("[AutoTUI] HTTP Server started on port " + port)
        
        });
    }
  

}

require('node-cleanup')((exitCode, signal) => {
    console.log("Stopping [TLM] HTTP Server ...", exitCode, signal);
    if (httpServer) httpServer.close();
});

startWebServer()
    .then(() =>  console.log("[AutoTUI] Is running"))
    .catch(error => console.log("[AutoTUI] Cannot start", error));
