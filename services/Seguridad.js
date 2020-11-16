const ZModule = require("../z-server").ZModule;
const SQLServer = require('./SQLServer').SQLServer;
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuidv4');
const nodemailer = require("nodemailer");
// const smtpConfig = require("./Config").Config.instance.getConfig().smtp;
const cnfPwd = require("./Config").Config.instance.getConfig().configPassword;
let moment = require('moment-timezone');

const log = require('simple-node-logger').createSimpleLogger('logs/administracion/'+moment().format('MM-DD-YYYY')+'.log');


const adminConfig = require("./Config").Config.instance.getConfig().adminDefault;
let general = require("./Config").Config.instance.getConfig().general;

class Seguridad extends ZModule {
    constructor() {
        super();
        //this._transport = nodemailer.createTransport(smtpConfig);
    }
    static get instance() {
        if (!global.seguridadInstance) global.seguridadInstance = new Seguridad();
        return global.seguridadInstance;
    }

    async getPrivilegios( filtro) {
        let params;
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            params = {
                filtro: filtro.filtro.toLowerCase().trim(),
                activo:filtro.activo==null?"":filtro.activo
            }
            let rows = await db.executeDirect("EXEC [dbo].[PRO_Busca_Privilegios] @filtro = N'"+params.filtro+"', @activo = N'"+params.activo+"'");
            //let rows = await db.executeDirect("[dbo].[PRO_Busca_Privilegios] @filtro , @activo",params);

            return rows.map(r => {
                return {id:r.id, codigo:r.codigo, nombre:r.nombre, activo:r.activo == "S"}
            })
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async addPrivilegio(privilegio) {
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                nombre: privilegio.nombre,
                codigo: privilegio.codigo,
                activo:privilegio.activo?"S":"N"
            }
            await db.executeDirect("EXEC [dbo].[PRO_Add_Privilegio] @nombre = N'"+params.nombre+"', @codigo = N'"+params.codigo+"', @activo = N'"+params.activo+"'");
            return privilegio;
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async deletePrivilegio(zToken, idPrivilegio) {

       // let p = await this.getPrivilegiosSesion(zToken);
       //if (!p.admin) throw "Privilegios Insuficientes";
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                idPrivilegio: idPrivilegio
            }
            await  db.executeDirect("EXEC [dbo].[PRO_Delete_Privilegio] @idPrivilegio = N'"+params.idPrivilegio+"'");
        } catch(error) {
            console.error(error);
            throw error;
        }
    }
    async savePrivilegio(privilegio){
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                idPrivilegio: privilegio.id,
                nombre: privilegio.nombre,
                codigo: privilegio.codigo,
                activo: privilegio.activo?'S':'N'
            }
            await  db.executeDirect("EXEC [dbo].[PRO_Update_Privilegio] @idPrivilegio = N'"+params.idPrivilegio+"', @nombre = N'"+params.nombre+"', @codigo =N'"+params.codigo+"', @activo = N'"+params.activo+"'");
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async inicializa() {
        let params;
        let con;
        let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
        params = {};

         // Asegurar que exista un administrador activo. Si no existe, se crea admin/admin
        let admins = await db.executeDirect("EXEC [dbo].[PRO_existeAdministrador]");
        if (!admins.length || parseInt(admins[0].n) === 0) {
            // Verificar que no exista un usuario 'admin'. Si existe, se activa, se hace administrador y se cambia su clave a 'admin'
            params = {
                login : adminConfig.login
            }
            let admin = await db.executeDirect("EXEC [dbo].[PRO_Get_Administrador] @login = N'"+params.login+"'");

            if (!admin.length || parseInt(admin[0].n) === 0) {
                // Crear administrador
                let adminPwd = await this.encript(adminConfig.login);
                params = {
                    email   : adminConfig.email,
	                nombres : adminConfig.nombre,
	                password: adminPwd
                }

                await await db.executeDirect("EXEC [dbo].[PRO_Add_Administrador] @login = N'"+params.login+"',@nombres = N'"+params.nombres+"',@password = N'"+params.password+"',@email = N'"+params.email+"'");

            } else {
                // Actualizar Administrador
                params = {
                    login	: adminConfig.login,
                }
                await await db.executeDirect("EXEC [dbo].[PRO_Save_Administrador] @login = N'"+params.login+"'");
            }
        }
    }

    encript(pwd) {
        return new Promise((onOk, onError) => {
            bcrypt.hash(pwd, 8, (err, hash) => {
                if (err) onError(err);
                else onOk(hash);
            });
        });
    }

    compareWithEncripted(pwd, hash) {
        return bcrypt.compare(pwd, hash);
    }

    async _creaTokenRecuperacion(email) {
        try {
            let token = uuidv4();
            let params;
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            params = {
                token: token,
                email:email
            }
            let rows = await db.executeDirect("EXEC [dbo].[PRO_Token_Recuperacion] @token = N'"+params.token+"', @email = N'"+params.email+"'");
            return token;
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async _getUsuarioPorEmail(email) {
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                login: email
            }
            let rows = await db.executeDirect("EXEC [dbo].[PRO_GetUsuarioEmail] @email = N'"+params.login+"'");
            if (!rows.length) return null;
            return rows[0];
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async login(email, pwd) {
        let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
        let rowsPrivilegios;
        const mensajeInvalido = "Usuario, Contraseña o tipo Inválidos";
        let u = await this._getUsuarioPorEmail(email);
        if (!u) throw mensajeInvalido;
        //if (u.ACTIVO != "S") throw "El usuario ha sido desactivado. Consulte al administrador del Sistema";
        if (!(await this.compareWithEncripted(pwd, u.PASSWORD))) throw mensajeInvalido;

        let params = {
            email: email
        }
        let rows = await db.executeDirect("EXEC [dbo].[PRO_GetSesionUsuario] @email = N'"+params.email+"'");
       console.log(rows)
        let sesion = {};
        if (rows.length){
            sesion.token = rows[0].token;
        } else {
            let token = uuidv4();
            params = {
                email: email,
                token: token
            }
            await db.executeDirect("EXEC [dbo].[PRO_Set_Sesion] @email = N'"+params.email+"', @token = N'"+params.token+"'");
            sesion.token = token;
        }
        params = {
            idPerfil: u.IDPERFIL==null ? -1 : u.IDPERFIL,
            idUsuario: u.ID==null ? -1 : u.ID
        }

        log.info("[Seguridad.login] => 'Ingreso al sistema usuario : "+ u.EMAIL+"'.")
        sesion.usuario = { id: u.ID, email: u.EMAIL, nombre: u.NOMBRES, perfil:u.IDPERFIL};

        return sesion;
    }

    async validatePwd(pwd){
        var regex = new RegExp('/^(?=.*[a-z]){'+cnfPwd.cantidadMinusculas+'}(?=.*[A-Z]){'+cnfPwd.cantidadMayusculas+'}(?=.*\d){'+cnfPwd.cantidadNum+'}(?=.*['+cnfPwd.listadoCaracteresEsp+']){'+cnfPwd.minCaracteresEspeciales+'}([A-Za-z\d'+cnfPwd.listadoCaracteresEsp+']){'+cnfPwd.minLarge+','+cnfPwd.maxLarge+'}$/');
      return regex.test(pwd);
    }

    async generaTokenRecuperacion(email) {
        let tokenRecuperacion;
        let usuario = await this._getUsuarioPorEmail(email);
        if (!usuario) throw "No se encontró ningún usuario con la identificación o dirección de correo indicado";
       // if(usuario.ACTIVO=='N')throw "El usuario se encuentra inactivo en el sistema.";
        try {
            tokenRecuperacion = await this._creaTokenRecuperacion(usuario.EMAIL);
        } catch(error) {
            throw "No se puede crear el token de recuperación:" + error.toString();
        }
        try {
            let url = general.urlSitioCorreo + "?recupera=" + tokenRecuperacion;

            await this._sendMail(usuario.EMAIL, "Recuperación de Contraseña en Sistema", null,
                "<html><body><hr />" +
                "<p><b>Sr(a). " + usuario.NOMBRES + ":</b></p>" +
                "<p>Se ha solicitado la creación de una nueva contraseña en el Sistema asociada a esta dirección de correo electrónico. Si usted no lo ha solicitado, sólo ignore este mensaje.</p>" +
                "<p>Su identificación de usuario (login) en el sistema es <b>" + usuario.EMAIL + "</b></p>" +
                "<p>Para crear su nueva contraseña, por favor haga click en <a href='" + url + "'>este enlace</a></p>" +
                "<hr /><p><i>Este es un correo automático del Sistema, por favor no lo responda.</i></p></body></html>"
            );
        } catch(error) {
            throw "No se puede enviar el correo al nuevo usuario:" + error.toString();
        }
    }

    // _sendMail(to, subject, text, html) {

    //     return new Promise((onOk, onError) => {
    //         let message = {
    //             from:smtpConfig.from,
    //             subject:subject,
    //             to:to,
    //             text:text,
    //             html:html
    //         }
    //         this._transport.sendMail(message, (err, info) => {

    //             if (err) onError(err);
    //             onOk(info);
    //         });
    //     })
    // }

    async getInfoRecuperacion(token) {
        try {
            let params;
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');

            params = {
                token: token
            }

            let rows = await db.executeDirect("EXEC [dbo].[PRO_InfoRecuperacion] @token = N'"+params.token+"'");

            if (!rows.length) throw "El token de recuperación de contraseña es inválido o ha caducado. Debe generar uno nuevo (opción 'Olvidé mi Contraseña' en la página inicial del sistema) o contactarse con el administrador del sistema";
            let u = rows[0];
            return {
                email:u.email, nombre:u.nombre
            }
        } catch(error) {
            console.error(error);
            throw error;
        }
    }


    async recuperaPwd(token, pwd1, pwd2) {
        try {
            let params;
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');

            let info = await this.getInfoRecuperacion(token);
            if(!this.validatePwd(pwd1)) throw "La contraseña no cumple con el formato establecido.";

            if (pwd1 != pwd2) throw "La contraseña y su repetición son diferentes";
            if (pwd1.trim().length < 4) throw "La contraseña es obligatoria y debe contener al menos 4 caracteres";
            let pwd = await this.encript(pwd1.trim());

            params = {
                email: info.email,
                pwd: pwd
            }

            await db.executeDirect("EXEC [dbo].[PRO_Pwd_recuperacion] @email = N'"+params.email+"', @pwd = N'"+params.pwd+"'");

            params = {
                token: token
            }

            await db.executeDirect("EXEC [dbo].[PRO_delete_token_recuperacion] @token = N'"+params.token+"'");

            return await this.login(info.email, pwd1);
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async cambiaPwd(zToken,sesion, pwd, pwd1, pwd2) {
        try {
            let params;
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let u = await this._getUsuarioPorEmail(sesion.email);
            if (!u) throw "Usuario eliminado";
           // if (u.ACTIVO != "S") throw "El usuario ha sido desactivado. Consulte al administrador del Sistema";
            if (! (await this.compareWithEncripted(pwd, u.PASSWORD))) throw "La contraseña actual es inválida";
            if(!this.validatePwd(pwd1)) throw "La contraseña no cumple con el formato establecido.";
            if (pwd1 != pwd2) throw "La nueva contraseña y su repetición son diferentes";
            if (pwd1.trim().length < 4) throw "La nueva contraseña es obligatoria y debe contener al menos 4 caracteres";

            let newPwd = await this.encript(pwd1.trim());

            params = {
                email: sesion.email,
                pwd: newPwd
            }

            await db.executeDirect("EXEC [dbo].[PRO_Pwd_recuperacion] @email = N'"+params.email+"', @pwd = N'"+params.pwd+"'");

        } catch(error) {
            console.error(error);
            throw error;
        }
    }


    async logout(token) {
        try {
            let params;
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');

            params = {
                token: token
            }
            await  db.executeDirect("EXEC [dbo].[PRO_delete_sesionUsuario] @token = N'"+params.token+"'");

        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async getPrivilegiosSesion(zToken) {
        let rows;
        let params;
        try {

            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            params = {
                token: zToken
            }
              rows= await  db.executeDirect("EXEC [dbo].[PRO_getPrivilegiosSesion] @token = N'"+params.token+"'");

        } catch(error) {
            console.error(error);
            throw error;
        }
        if (!rows.length) throw "Sesión de Usuario inválida o caducada";
        let r = rows[0];
        if (r.activo != "S") throw "El usuario ha sido desactivado. Consulte al administrador del Sistema";
        return {login:r.login, admin:r.admin == "S"}
    }


    async getUsuarios(zToken, filtro) {
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                filtro: filtro.filtro
            }
            let rows = await  db.executeDirect("EXEC [dbo].[PRO_getUsuarios] @filtro = N'"+params.filtro+"'");
            return rows.map(r => {
                return { email:r.email, nombre:r.nombre, idPerfil:r.idPerfil, perfil:r.perfil}
            })

        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async getUsuario(email) {
        try {
            let rows;
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');

            let params = {
                email: email
            }
            rows = await  db.executeDirect("EXEC [dbo].[PRO_getUsuario] @email = N'"+params.email+"'");

            if (!rows.length) return null;
            return rows[0];
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async addUsuario(zToken, usuario) {
      console.log(usuario)
        let params;

        if (await this.getUsuario(usuario.email)) throw "Ya existe un usuario con la misma identificación (email)";
        let pwd = await this.encript(usuario.email);

        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            params = {
                password:pwd,
                nombres:usuario.nombre,
                email:usuario.email,
                empresa: "UV",
                admin:"S",
                idPerfil: usuario.idPerfil
            }
            await  db.executeDirect("EXEC [dbo].[PRO_Add_Usuario1] @nombres = N'"+params.nombres+"', @password = N'"+params.password+"', @email = N'"+ params.email+"', @empresa = N'"+ params.empresa+"', @admin = N'"+params.admin+"', @idPerfil = N'"+params.idPerfil+"'");
            return usuario;
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async saveUsuario(zToken, usuario) {
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                nombre:usuario.nombre,
                email:usuario.email,
                idPerfil: usuario.idPerfil
            }
            await  db.executeDirect("EXEC [dbo].[PRO_Update_Usuario] @email = N'"+ params.email+"', @nombres = N'"+params.nombre+"',@idPerfil = N'"+params.idPerfil+"'");

            return usuario;
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    async deleteUsuario(zToken, usuario,loginModificacion) {

        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            let params = {
                filtro:usuario.email,
                email: usuario.email
            }
            await  db.executeDirect("EXEC [dbo].[PRO_delete_TodasLasSesionesDeUsuario] @email = N'"+params.email+"'");
            await  db.executeDirect("EXEC [dbo].[PRO_Delete_Usuario] @email = N'"+params.email+"'");
        } catch(error) {
            console.error(error);
            throw error;
        }
    }

    /******* perfiles *******/
    async getPerfiles( filtro) {
        let params;
        try {
            let db = new SQLServer('10.10.1.10','sa','qwerty01x','BiblioAdm');
            params = {
                filtro: filtro.filtro.toLowerCase().trim(),
                activo:filtro.activo==null?"":filtro.activo
            }
            let rows = await db.executeDirect("EXEC [dbo].[PRO_Busca_Perfiles] @filtro = N'"+params.filtro+"', @activo = N'"+params.activo+"'");

            return rows.map(r => {
                return {id:r.id, perfil:r.nombre, activo:r.activo == "S"}
            })
        } catch(error) {
            console.error(error);
            throw error;
        }
    }





}

exports.Seguridad = Seguridad;