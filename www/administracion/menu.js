class CustomController extends ZCustomComponent {
    onThis_init() {
       this.lblNombreUsuario.view.text(window.app.sesion.usuario.nombre);
        console.log(window.app.sesion)
        if(window.app.sesion.usuario.perfil=="10019"){
            this.cmdSistemas.hide()
            this.cmdConfUsuarios.hide()
        }else{
            this.cmdPrestamos.hide()
        }
    }

    onCmdPrestamos_click() {
        this.mainLoader.load("./asistentes/prestamos");
    }
    onCmdSistemas_click() {
        this.mainLoader.load("./admin/sistemas");
    }

    onCmdConfUsuarios_click() {
        this.mainLoader.load("./admin/usuarios");
    }
   
   

   async onCmdLogout_click() {
        delete window.app.sesion;
        await zPost("logout.seg", {token:window.zSecurityToken});
        window.zSecurityToken = null;
        location.reload()
    }
    onCmdHome_click() {
        this.mainLoader.load("./Home");
    }
    onCmdCambiarPwd_click() {
        this.showDialog("login/WCambiarPwd");
    }


    
    onVistaLoader_volver() {
        this.mainLoader.pop();
    }

    onMenutoggle_click() {
        this.menutoggle.toggleclass
    }

}