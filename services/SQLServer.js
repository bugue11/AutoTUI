const Connection = require("tedious").Connection;
const TYPES = require('tedious').TYPES;
const Request = require('tedious').Request;

function getSQLServerType(js) {
    if (js === null) return TYPES.Null;
    if (js instanceof String) {
        return TYPES.NVarChar;
    }
    if (js instanceof Number) {
        return (js % 1 === 0)?TYPES.Int:TYPES.Float;
    }
    if (js instanceof Date) {
        return TYPES.DateTime;
    }
    if (js instanceof Boolean) {
        return TYPES.Bit;
    }
    if (js instanceof Buffer) {
        return TYPES.VarBinary;
    }

    switch(typeof js) {
        case "string":  return TYPES.NVarChar;
        case "number":  
            if (js % 1 === 0) return TYPES.Int;
            else return TYPES.Float;
        case "boolean": return TYPES.Bit;            
    }    
    return 
}

class SQLServer {
    constructor(server,userName,password,database) { 
         this.config = {
            server: server,
            options : {
                encrypt:true,
                database:database
            },
            authentication : {
                type : "default",
                options : {
                    userName : userName,
                    password : password
                }
            }
        };
    } 
    get tdTYPES() {return TYPES}
    get tdRequest() {return Request}
    
    getConnection(extraOpts) {
        return new Promise((onOk, onError) => {
            let config = JSON.parse(JSON.stringify(this.config));
            if (extraOpts) {
                Object.keys(extraOpts).forEach(name => config.options[name] = extraOpts[name]);
            }
            let con = new Connection(config);
            con.on("connect", err => {
                if (err) onError(err);
                else {
					console.log("sqlserver new connection created");
                    onOk(con);
                }
            });
			con.on("error", err => {
                console.log("****** sqlserver connection error", err);
            });
			con.on("infoMessage", m => {
                //console.log("sqlserver info message", m);
            });
			con.on("errorMessage", m => {
                console.log("sqlserver error message", m);
            });
        });
    }
    executeDirect(sql, params) {
        return new Promise((onOk, onError) => {            
            this.getConnection({useColumnNames:true, rowCollectionOnRequestCompletion:false, rowCollectionOnDone:false})
                .then(con => {
                    let rows = [];
                    let request = new Request(sql, (err, rowCount, retRows) => {
                        con.close();
						console.log("sqlserver connection closed");
                        if (err) onError(err);
                        onOk(rows);
                    });
                    Object.keys(params?params:{}).forEach(name => request.addParameter(name, getSQLServerType(params[name]), params[name]));
                    request.on("row", cols => {
                        let row = {};
                        Object.keys(cols).forEach(name => row[name] = cols[name].value);
                        rows.push(row);
                    });
                    request.on("error", err => onError(err));
                    con.execSql(request);
                })
                .catch(err => onError(err));
        });
    }
}
module.exports.SQLServer = SQLServer