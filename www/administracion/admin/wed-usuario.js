class CustomController extends ZCustomComponent {
    onThis_init(options) {
        this.options = options;
        this.mensajeError.hide();
        this.loading.hide();
      

        if (options.newRecord) {
            this.title.view.text("Crear Nuevo Usuario");
            this.lblAccion.view.text("Nuevo Usuario: ");
             setTimeout(() => {
                 this.edCorreo.view.focus();
             }, 500);
        } else {
            this.title.view.text("Editar Usuario");
            this.lblAccion.view.text("Editar Usuario: ");
            let u = options.record;
            this.edNombre.val = u.nombre;
            this.edCorreo.val = u.email;
            this.edPerfiles.enable();
        }
        

         let filtro = {
            filtro: "",
             activo: "S"
         }

        zPost("getPerfiles.seg", { filtro: filtro })
            .then(perfiles => this.edPerfiles.setRows(perfiles, options.newRecord ? null : options.record.idPerfil))
            .catch(error => console.error(error));

    }

    onCmdCancel_click() { this.cancel() }
    muestraError(txt) {
        this.textoMensajeError.view.text(txt);
        this.mensajeError.show();
    }

    onCmdOk_click() {
        let u = {
            nombre: this.edNombre.val,
            email: this.edCorreo.val,
            idPerfil: this.edPerfiles.val == null ? 1 : this.edPerfiles.val,
            perfil: options.newRecord ? '': this.edPerfiles._rows.find(perfil => {return perfil.id == this.edPerfiles.val}).perfil,
            loginModificacion: window.app.sesion.usuario.email
        }

        let findError = false;

        if (!u.nombre) {
            findError = true;
            this.edNombre.setValidation(false);
        } else {
            this.edNombre.setValidation(true);
        }

        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!u.email) {
            findError = true;
            this.edCorreoInvalid.text = "Debe ingresar un email";
            this.edCorreo.setValidation(false);
        } else if (!re.test(u.email)) {
            findError = true;
            this.edCorreoInvalid.text = "Debe ingresar un email válido";
            this.edCorreo.setValidation(false);
        } else {
            this.edCorreo.setValidation(true);
        }

        if (!u.admin) {
            if (this.edPerfiles.val == null) {
                findError = true;
                this.edPerfiles.setValidation(false);
            } else {
                this.edPerfiles.setValidation(true);
            }
        }

        if (findError) {
            this.muestraError("Favor corregir la información según se indica.");
            return;
        }
   
        this.mensajeError.hide();

        if (this.options.newRecord) {
         
            zPost("addUsuario.seg", { zToken: window.zSecurityToken, usuario: u })
                .then(usuario => {
                    this.cmdOk.enable();
                    this.loading.hide();
                    this.close(usuario)
                })
                .catch(error => this.showDialog("common/WError", { message: error.toString() }));
        } else {
            this.cmdOk.disable();
            zPost("saveUsuario.seg", { zToken: window.zSecurityToken, usuario: u })
                .then(usuario => {
                    this.cmdOk.enable();
                    this.loading.hide();
                    this.close(usuario)
                }
                )
                .catch(error => this.showDialog("common/WError", { message: error.toString() }));
        }
    }
    onEdAdmin_change() {
    }
}