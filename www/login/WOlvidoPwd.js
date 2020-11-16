class CustomController extends ZCustomComponent {
    onThis_init(options) {
       
        this.mensajeError.hide();
        this.mensajeEnviando.hide();
        this.loading.hide();
        if (options.login) this.edLogin.val = options.login;
        this.view.on("keyup", e => {
            if (e.keyCode == 13) this.cmdOk.view.trigger("click");
        })
        setTimeout(_ => this.edLogin.view.focus(), 500);
    }
    onCmdCancel_click() {this.cancel()}
    muestraError(txt) {
        this.mensajeEnviando.hide();
        this.textoMensajeError.view.text(txt);
        this.mensajeError.show();        
    }
    onCmdOk_click() {
        this.mensajeError.hide();
        this.mensajeEnviando.hide();
        let email = this.edLogin.val.trim();
        
        if (!email) {
            this.muestraError("Identificación inválida");
            return;
        }
        this.mensajeError.hide();
        this.mensajeEnviando.hide();
        this.loading.show();
        this.cmdOk.disable();
        zPost("generaTokenRecuperacion.seg", {email:email})
            .then(_ => {
                this.mensajeEnviando.hide();
                this.cmdOk.enable();
                this.loading.hide();
                this.showDialog("common/WInfo", {message:"Se le ha enviado un mensaje a su dirección de correo electrónico. Siga las instrucciones en el mensaje para la creación de la nueva contraseña"});
                this.close();
            })
            .catch(error =>{
                 this.muestraError(error.toString())
                 this.loading.hide();
                }
                 );
    }
}