class CustomController extends ZCustomComponent {
    onThis_init() {      
        $(window).resize(() => {
	        if (window.app.resize) window.app.resize();
        });
        let url = new URL(window.location.href);
        // let tokenRecuperacion = url.searchParams.get("recupera");
        // if (tokenRecuperacion) {
        //     this.mainLoader.load("login/PanelRecupera", {tokenRecuperacion:tokenRecuperacion});
        // } else { 
        //     this.mainLoader.load("login/login");
        // }
        this.mainLoader.load("main/menu");
    }
    onMainLoader_ingreso() {
       this.mainLoader.load("login/login");
    }

    onMainLoader_login(sesion) {
        window.app.sesion = sesion;
        window.zSecurityToken = sesion.token;
       this.mainLoader.load("administracion/menu");
    }
    async onMainLoader_logout() {
        delete window.app.sesion;
        await zPost("logout.seg", {token:window.zSecurityToken});
        window.zSecurityToken = null;
        this.mainLoader.load("main/menu");
    }
}