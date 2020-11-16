const ZModule = require("../z-server").ZModule;
let fs = require('fs');
let path = require('path');
let shell = require('shelljs');


class Utils extends ZModule {
    constructor() {
        super();
    }
    static get instance() {
        if (!global.utilsInstance) global.utilsInstance = new Utils();
        return global.utilsInstance;
    }

    static create() {

        return new Utils();
    }


    object2Date(o) {
        return new Date(o.ano, o.mes, o.dia, 0, 0, 0);
    }

    object2Datetime(o) {
        return new Date(o.ano, o.mes, o.dia, o.hora, o.minutos, o.segundos);
    }

    stringToDateTime(dateString) {
        let cadena;
        let fecha = [];
        let ano;
        let mes;
        let dia;
        let hora;
        let minutos;
        let segundos;

        cadena = dateString.replace(" ", "-");
        cadena = cadena.replace(":", "-");
        cadena = cadena.replace(":", "-");
        fecha = cadena.split("-");

        dia = fecha[0];
        mes = fecha[1];
        ano = fecha[2];
        hora = fecha[3];
        minutos = fecha[4];
        segundos = fecha[5];

        return new Date(ano, mes, dia, hora, minutos, segundos);

    }
	
	    stringFormato(dateString) {
        let cadena;
        let fecha = [];
        let ano;
        let mes;
        let dia;
        let hora;
        let minutos;
        let segundos;

        cadena = dateString.replace(" ", "-");
        cadena = cadena.replace(":", "-");
        cadena = cadena.replace(":", "-");
        fecha = cadena.split("-");

        dia = fecha[0];
        mes = fecha[1];
        ano = fecha[2];
        hora = fecha[3];
        minutos = fecha[4];
        segundos = fecha[5];
 
        return ano+"-"+mes+"-"+dia+" "+hora+":"+minutos+":"+segundos;

    }
	
	
    getExtension(filename, extension) {

        if (filename.length == 0)
            return "";

        if (extension)
            return filename.split('/').pop().split('.')[1];// devuelve extension
        else
            return filename.split('/').pop().split('.')[0];//devuelve nombre sin extension
    }

     devuelveArchivos(dir, pattern) {
        var results = [];
        var fileName;

        // This is where we store pattern matches of all files inside the directory
 
        // Read contents of directory
        fs.readdirSync(dir).forEach(function (dirInner) {
            // Obtain absolute path

            fileName = dirInner;
            dirInner = path.resolve(dir, dirInner);
            // Get stats to determine if path is a directory or a file
            var stat = fs.statSync(dirInner);
            // If path is a directory, scan it and combine results
           /* if (stat.isDirectory()) {
                results = results.concat(devuelveArchivos(dirInner, pattern));
            }*/
            // If path is a file and ends with pattern then push it onto results
            if (stat.isFile() && dirInner.endsWith(pattern)) {
                results.push(fileName);
            }
        });

        return results;
    };

    existeDirectorio(ruta) {
        if (!fs.existsSync(ruta)) {
            shell.mkdir('-p',ruta);
            //fs.mkdirSync(ruta);
        }
    }

    existeArchivo(file) {
        let flag = true;
        try {//existe el archivo
            fs.accessSync(file, fs.F_OK);
        } catch (e) { //no existe archivo
            flag = false;
        }
        return flag;
    }
	
	entornoVirtualTemporal(ruta){
		shell.pushd(ruta);
	}
	
	cd(ruta){
		shell.cd(ruta);
	}
	
	 

    readFiles(dir, processFile) {
        // read directory
        fs.readdir(dir, (error, fileNames) => {
            if (error) throw error;

            fileNames.forEach(filename => {
                // get current file name
                const name = path.parse(filename).name;
                // get current file extension
                const ext = path.parse(filename).ext;
                // get current file path
                const filepath = path.resolve(dir, filename);

                // get information about the file
                fs.stat(filepath, function (error, stat) {
                    if (error) throw error;

                    // check if the current path is a file or a folder
                    const isFile = stat.isFile();

                    // exclude folders
                    if (isFile) {
                        // callback, do something with the file

                        processFile(filepath, name, ext, stat);
                    }
                });
            });
        });
    }

    //comprueba si un elemento existe en un array
    isInArray(valor, array) {
        let existe = array;
        return existe.includes(valor);
    }

    duracionAminutos(tiempo) {
        let hms = tiempo;
        let t = hms.split(':');
        let hora = t[0];
        let minutos = t[1];
        let segundos = t[2];
        let minutes = (parseInt(hora)) * 60 + (parseInt(minutos));
        //return minutes + "," + ((parseInt(segundos)) / 60);
        return Math.floor(minutes + ((parseInt(segundos)) / 60));
    }

    correlativo(correlativo) {
        if (correlativo == 0) correlativo = 1;
        else correlativo = correlativo;

        switch (correlativo.toString().length) {
            case 1: correlativo = "000000" + correlativo;
                break;
            case 2: correlativo = "00000" + correlativo;
                break;
            case 3: correlativo = "0000" + correlativo;
                break;
            case 4: correlativo = "000" + correlativo;
                break;
            case 5: correlativo = "00" + correlativo;
                break;
            case 6: correlativo = "0" + correlativo;
                break;
            case 7: correlativo = correlativo;
                break;
            default: correlativo;
        }
        return correlativo;
    }

    quitarCaracteres(cadena, caracter, nuevoCaracter) {

        for (let i = 0; i < cadena.length; i++) {
            cadena = cadena.toString().replace(caracter, nuevoCaracter)
        }
        return cadena;
    }

    fechaActual() {
        let dt = new Date();
        let ano = dt.getFullYear();
        let mes = dt.getMonth() + 1;
        let dia = dt.getDate();

        if (mes < 10) mes = "0" + mes;
        else mes = mes;

        if (dia < 10) dia = "0" + dia;
        else dia = dia;

        return ano + "" + mes + "" + dia;
    }

    inicializarCorrelativo() {
        let cont = 0;
        let segundos = 86400;//segundos de un día
        let ret = "";
        setInterval(function () {
            cont++;
            if (cont == segundos) {
                cont = 0;
                ret = true;
            }
        }, 1000);
        return ret;
    }

    convertidorTiempo(tiempo, tipo) {
        if (tipo == 'minutos')
            return tiempo * 60
        else if (tipo == 'hora')
            return Math.floor(tiempo / 60);
    }

    sumarMinutos() {
        return total;
    }


    removeValueArray(arr, value) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === value) {
                arr.splice(i, 1);
                break;
            }
        }
        return arr;
    }

    conversorAudio(fileConversionAudios, carpeta, formatoAudio) {
        let ruta;
        /*
        -i input
        -y sobreescribe si existe el archivo de salida
        -n no sobreescribe si existe el archivo de salida
        */

        for (let i = 0; i < fileConversionAudios.length; i++) {
            let nombreAudio = this.getExtension(fileConversionAudios[i], false);
            ruta = __dirname + '//conversorAudio//ffmpeg//bin//ffmpeg -i ' + carpeta + '//' + fileConversionAudios[i] + ' -n ' + carpeta + '//' + nombreAudio + '.wav';
            shell.exec(ruta);
        }
    }

    getNumeroSemana() {
        let hoy = new Date();
        var ano = new Date(hoy.getFullYear(), 0, 1);
        return Math.ceil((((hoy - ano) / 86400000) + ano.getDay() + 1) / 7);
    }

    nombreMes(mes) {
        switch (mes) {
            case 1: return "Enero";
                break;
            case 2: return "Febrero";
                break;
            case 3: return "Marzo";
                break;
            case 4: return "Abril";
                break;
            case 5: return "Mayo";
                break;
            case 6: return "Junio";
                break;
            case 7: return "Julio";
                break;
            case 8: return "Agosto";
                break;
            case 9: return "Septiembre";
                break;
            case 10: return "Octubre";
                break;
            case 11: return "Noviembre";
                break;
            case 12: return "Diciembre";
                break;

        }
    }
	
	 verificaDirectorio(ruta) {
        if (!fs.existsSync(ruta)) 
            return false;
        else return true;   
    }

}

exports.Utils = Utils;