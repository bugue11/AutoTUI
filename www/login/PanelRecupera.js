class CustomController extends ZCustomComponent {
    onThis_init(options) {
        this._tokenRecuperacion = options.tokenRecuperacion;
   
        this.edPwd1.view.focus();
        this.view.on("keyup", e => {
            if (e.keyCode == 13) this.cmdCambiar.view.trigger("click");
        })        
        zPost("getInfoRecuperacion.seg", {token:options.tokenRecuperacion})
            .then(info => this.edLogin.val = "[" + info.email + "] " + info.nombre)
            .catch(error => {
                this.cmdCambiar.disable();
                this.edLogin.val = "ERROR: " + error.toString();
                this.showDialog("common/WError", {message:error.toString()});
            })
    }

    onCmdCambiar_click() {
        zPost("recuperaPwd.seg", {token:this._tokenRecuperacion, pwd1:this.edPwd1.val, pwd2:this.edPwd2.val})
            .then(sesion => this.triggerEvent("login", sesion))
            .catch(error => this.showDialog("common/WError", {message:error.toString()}));
    }
}