"use strict";

const ZModule = require("../z-server").ZModule;
var config = null;
const RJSON = require("relaxed-json");

class Config extends ZModule {
	static get instance() {
		if (!global.configInstance) global.configInstance = new Config();
		return global.configInstance;
	}
	get() {
		return new Promise((onOk, onError) => {
			if (config) {
				onOk(config);
			} else {			
				console.log("[PRecurdos] Using config file at " + global.confPath);
				require("fs").readFile(global.confPath, (err, data) => {
					if (err) onError(err);
					else {
						config = RJSON.parse(data.toString());
						onOk(config);
					}
				});
			}
		})
	}
	getSync() {
		if (config) return(config);
		console.log("[PRecursos] Using config file at " + global.confPath);
		config = JSON.parse(require("fs").readFileSync(global.confPath));
		return config;
	}
	getConfig() {
        if (this._config) return this._config;
        this._config = JSON.parse(require("fs").readFileSync(global.confPath))
        return this._config;
    }
}

exports.Config = Config;
