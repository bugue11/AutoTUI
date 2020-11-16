class CustomController extends ZCustomComponent {
    onThis_init() {
        this.edLogin.focus();
        this.view.on("keyup", e => {
            if (e.keyCode == 13) this.cmdLogin.view.trigger("click");
        });
    }
    async onCmdLogin_click() {
        let email = this.edLogin.val;
        let pwd = this.edPwd.val;
/*         let sesion = 0;
        this.triggerEvent("login", sesion);
 */         try {
             let sesion = await zPost("login.seg", { email, pwd });
             this.triggerEvent("login", sesion);
         } catch (error) {
             this.showDialog("common/WError", { message: error.toString() })
         }
    }

    onCmdOlvidoPwd_click() {
        this.showDialog("./WOlvidoPwd", { login: this.edLogin.val });
    }
}