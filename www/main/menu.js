class CustomController extends ZCustomComponent {
    onThis_init() {

    }

   

    onCmdlogin_click(){
        this.triggerEvent("ingreso");
    }
    
  
    onVistaLoader_volver() {
        this.mainLoader.pop();
    }

    onMenutoggle_click() {
        this.menutoggle.toggleclass
    }

}