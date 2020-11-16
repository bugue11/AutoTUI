const ZModule = require("../z-server").ZModule;
const SQLServer = require('./SQLServer').SQLServer;
const axios = require("axios");
const utils = require('./Utils').Utils;
let fs = require('fs');
let moment = require('moment-timezone');
const sistem= require("./Config").Config.instance.getConfig().general;
const sqlUV = require("./Config").Config.instance.getConfig().sqlUV;
const log = require('simple-node-logger').createSimpleLogger('logs/importaciones/' + moment().format('MM-DD-YYYY') + '.log');

class Autoprestamouv extends ZModule {
    constructor() {
        super();

    }
    static get instance() {
        if (!global.autoprestamouvInstance) global.autoprestamouvInstance = new Autoprestamouv();
        return global.autoprestamouvInstance;
    }
async deleteSis(id){
    let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
    try {
        let query = "DELETE FROM dbo.sistema_autoprestamo WHERE sis_id= "+id+""   
        await db.executeDirect(query);


    }catch(err){
        console.log(err)
        throw err
    }
}
async addSis(sistema){
    let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
    try {
        let query = "INSERT INTO dbo.sistema_autoprestamo"
        let p = sistema
        let obj = this.formatValueAndDataInsertQuery(p)
        let finalquery = query + ' ' + obj.fieldsQuery + ' VALUES ' + obj.paramsQuery;
        //console.log(finalquery)
       await db.executeDirect(finalquery, obj.paramsData);


    }catch(err){
        console.log(err)
        throw err
    }


}
    async getAllsistemas(filtro) {
        //console.log(sistem.idSistema)

        if (filtro.filtro === '') {
            // console.log("filtro vacio")
            var test = "%"
        } else {
            var test = "%" + filtro.filtro + "%"
        }
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let query = "SELECT * from dbo.sistema_autoprestamo WHERE biblioteca LIKE '" + test + "'"
            query += "OR Estado LIKE '" + test + "'"
            query += "ORDER BY sis_id"
            let col = await db.executeDirect(query)
            //  console.log(col)
            return col;

        } catch (err) {
            console.log(err)
        }


    }
    async getAllprestamosDate(from,to){
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let query = "SELECT * from dbo.prestamo WHERE fecha_inicio BETWEEN '"+from+"' AND '"+to+"' "
            query += "ORDER BY idx"
            //console.log(query)
            let col = await db.executeDirect(query)
             //console.log(col)
            return col;

        } catch (err) {
            console.log(err)
        }

    }

    async getAllprestamos(filtro) {

        if (filtro.filtro === '') {
            // console.log("filtro vacio")
            var test = "%"
        } else {
            var test = "%" + filtro.filtro + "%"
        }
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let query = "SELECT * from dbo.prestamo WHERE alumno_id LIKE '" + test + "'"
            query += "OR estado LIKE '" + test + "'"
            query += "OR ubicacion LIKE '" + test + "'"
            query += "ORDER BY idx"
            let col = await db.executeDirect(query)
            //  console.log(col)
            return col;

        } catch (err) {
            console.log(err)
        }


    }
    async getOneSistema(id){
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
            let pres = await db.executeDirect("SELECT * from dbo.sistema_autoprestamo WHERE sis_id = '" + id + "'")
            return pres
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    
    async getOnePrestamo(id){
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
            let pres = await db.executeDirect("SELECT * from dbo.prestamo WHERE idx = '" + id + "'")
            return pres
        } catch (err) {
            console.log(err)
            throw err
        }
    }
   async getPrestamos(id){
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
            let pres = await db.executeDirect("SELECT * from dbo.prestamo WHERE sis_id = '" + id + "' ORDER BY idx")
            return pres
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async Updateprestamo(id, estado) {
       // console.log(id, estado)
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            let query = "UPDATE dbo.prestamo SET estado= '" + estado + "' WHERE idx='" + id + "'"
            return await db.executeDirect(query)

        } catch (err) {
            console.log(err)
            throw err
        }

    }
    async getprestamo(rut) {
        //  console.log(rut)
        let estado = "Activo"
        //let prueba = "18971847-0"
        try {
            let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
            let pres = await db.executeDirect("SELECT * from dbo.prestamo WHERE alumno_id = '" + rut + "' AND estado ='" + estado + "'")
            return pres[0]
        } catch (err) {
            console.log(err)
            throw err
        }


    }
    async getlibros(id) {
        try {
            let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
            let pres = await db.executeDirect("SELECT * from dbo.Libro WHERE prestamo_idx = '" + id + "'")
            return pres
        } catch (err) {
            console.log(err)
            throw err
        }


    }
    async getalumno(cod) {
        // console.log(cod)
        this.alumno = []
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
        try {
            this.alumno = await db.executeDirect("SELECT * from dbo.uv WHERE rut = '" + cod.trim() + "'")
            if (this.alumno.length == 0) {
                return "Información del estudiante no encontrada, consulte con el administrador"
            } else if (this.alumno[0].estado.trim() != "REGULAR") {

                return "Usted no posee la condición de alumno 'regular' necesaria para realizar préstamos"
            } else {
                try {
                    let err = "Activo"
                    let pres = await db.executeDirect("SELECT * from dbo.prestamo WHERE alumno_id = '" + cod.trim() + "' AND estado='" + err + "'")
                   // console.log(pres)
                    if (pres.length > 0) {

                        return "Usted posee un préstamo pendiente"

                    } else {
                        try {
                            let d = await db.executeDirect("SELECT * from dbo.Alumno WHERE rut = '" + cod.trim() + "'")
                            //console.log(d)
                            if (d[0]) {
                                if (d[0].deuda > 0) {

                                    return "Usted posee deudas en este sistema, por favor regularice su situación"
                                } else {
                                    let x = {
                                        rut: this.alumno[0].rut.trim(),
                                        nombre: this.alumno[0].nombre.trim()
                                    }
                                    return x
                                }
                            } else {
                                let x = {
                                    rut: this.alumno[0].rut.trim(),
                                    nombre: this.alumno[0].nombre.trim()
                                }
                                return x
                            }
                        } catch (err) {
                            console.log(err)
                            return "Error al validar los datos, intente de nuevo mas tarde"
                        }

                    }
                } catch (error) {
                    console.log(error)
                    return "Error al validar los datos, intente de nuevo mas tarde"
                }
            }

        } catch (error) {
            console.error(error);
            return "Error al validar los datos, intente de nuevo mas tarde"
        }
    }
    async tuirut() {
        this.dat

        const spawn = require('child_process').spawn;
        const rut = spawn('python', ['C:/Users/ares_/Desktop/main.py'])
        return new Promise((res, rej) => {
            rut.stdout.on('data', (data) => {
                //console.log(data.toString())
                this.dat = data.toString()
                res(this.dat)
            })
        })



    }

    async insertPrestamo(alumno, libros) {
        this.l=[]
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");
         //agregar select del sistema para agregar ubicacion
         let col = await db.executeDirect("SELECT Biblioteca FROM dbo.sistema_autoprestamo WHERE sis_id = "+sistem.idSistema+"")
          var biblio=col[0].Biblioteca
        //  return col
        
         let alumn = {
            rut: alumno.rut.trim(),
            nombre: alumno.nombre.trim(),
            deuda: 0
        }
      
        try {
            let alum = await db.executeDirect("SELECT * from dbo.Alumno WHERE rut = '" + alumno.rut.trim() + "'");
            if (alum.length == 0) {
                let query = "INSERT INTO dbo.Alumno"
                let a = alumn
                let al = this.formatValueAndDataInsertQuery(a)
                let queryalumnos = query + ' ' + al.fieldsQuery + ' VALUES ' + al.paramsQuery;

                await db.executeDirect(queryalumnos, al.paramsData);
            }
        var currentdate = moment().format('DD/MM/YYYY,HH:mm')
        for (let i in libros){
           // console.log(libros[i].tipo)
            if(libros[i].tipo=="tesis"){
                var futuredate = moment().add(2, 'day');
            }else{
                var futuredate = moment().add(4, 'day');
    
            }
           
             let prestamo = {
                sis_id: sistem.idSistema,
                alumno_id: alumno.rut.trim(),
                fecha_inicio: currentdate,
                fecha_termino: futuredate.format('DD/MM/YYYY'),
                estado: "Activo",
                ubicacion: biblio
             }
            // console.log(prestamo)
             try {
                let query2 = "INSERT INTO dbo.prestamo"
                let p = prestamo
                let obj = this.formatValueAndDataInsertQuery(p)
                let finalquery = query2 + ' ' + obj.fieldsQuery + ' VALUES ' + obj.paramsQuery;
              //  console.log(finalquery)
               await db.executeDirect(finalquery, obj.paramsData);
        
                } catch (err) {
                  //  console.log(err)
                         if (err && err.code && (err.code = 'ETIMEOUT' || err.code == 'ESOCKET')) throw err;
                          console.log("Falló la inserción del registro", finalquery, obj.paramsData, err);
                }
        

                try {
                    
                     // seleccionar el ultimo registro 
                     
                         let col = await db.executeDirect("  SELECT TOP 1 * FROM dbo.prestamo WHERE alumno_id = '" + alumno.rut.trim() + "' AND estado='Activo' ORDER BY idx DESC")
                        // console.log(col)
                         var id= col[0].idx
                         let lib ={
                            cod: libros[i].cod,
                            titulo: libros[i].nombre,
                            tipo:libros[i].tipo,
                            prestamo_idx: id
                         }
                         try{
                            let query = "INSERT INTO dbo.Libro"
                            let k = this.formatValueAndDataInsertQuery(lib)
                            let libquery = query + ' ' + k.fieldsQuery + ' VALUES ' + k.paramsQuery;
                            await db.executeDirect(libquery, k.paramsData);

                         }catch(err){
                            console.log(err)
                         }
                }catch (err){
                    console.log(err)
                }   
                let doc={
                    titulo:libros[i].nombre,
                    devolucion: futuredate.format('DD/MM/YYYY'),
                    ubicacion: biblio
        
                    }
                    this.l.push(doc)
        
            }
            return (this.l)
           
        
    

         } catch (error) {
             console.log(error)

         }
      
         let doc={
            titulo:libros[i].nombre,
            devolucion: futuredate.format('DD/MM/YYYY')

            }
            this.l.push(doc)

    }
    async getBarcode(code) {
        log.info('[Barcode prueba]')
        let db = new SQLServer(sqlUV.server, sqlUV.userName, sqlUV.password, "Biblio");

        try {
            let col = await db.executeDirect("SELECT * from dbo.invent WHERE cod = '" + code.scanCode + "'")
            //console.log(col)
            if (col.length > 0) {
                //console.log("golaa")
                let book = {
                    idx:col[0].idx,
                    cod: col[0].cod.trim(),
                    autor: col[0].autor.trim(),
                    nombre: col[0].nombre.trim(),
                    tipo: col[0].tipo.trim()
                }
                return book
            } else {
                return false
            }


        } catch (error) {
            console.log(error)
            throw error
        }


    }

    formatValueAndDataInsertQuery(objData) {
        let fieldsQuery = "";
        let paramsQuery = "";
        let paramsData = {};
        Object.keys(objData ? objData : {}).forEach(name => {
            if (objData[name] != null) {
                fieldsQuery += (fieldsQuery ? "," : "") + name;
                paramsQuery += (paramsQuery ? ", @" : "@") + name;
                paramsData[name] = objData[name];
            }
        })

        fieldsQuery = fieldsQuery ? "(" + fieldsQuery + ")" : "";
        paramsQuery = paramsQuery ? "(" + paramsQuery + ")" : "";

        return {
            fieldsQuery: fieldsQuery,
            paramsQuery: paramsQuery,
            paramsData: paramsData
        }
    }

}
exports.Autoprestamouv = Autoprestamouv;