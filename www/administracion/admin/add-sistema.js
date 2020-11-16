class CustomController extends ZCustomComponent {
    onThis_init(options) {
        this.options = options;
        this.mensajeError.hide();
        this.loading.hide();
      

        if (options.newRecord) {
            this.title.view.text("Crear Nuevo AutoTUI");
            this.lblAccion.view.text("Nuevo AutoTUI: ");
        } 
    }

    onCmdCancel_click() { this.cancel() }
    muestraError(txt) {
        this.textoMensajeError.view.text(txt);
        this.mensajeError.show();
    }

    onCmdOk_click() {
        let u = {
            Biblioteca:  $('#edBiblio').val(),
            Estado: "Activo",
            Estanteria: this.edEstan.val,
    
        }
        console.log(u)

        let findError = false;

        if (!u.Biblioteca) {
            findError = true;
            this.edBiblio.setValidation(false);
        } else {
            this.edBiblio.setValidation(true);
        }
        if (!u.Estanteria || u.Estanteria==0) {
            findError = true;
            this.edEstan.setValidation(false);
        } else {
            this.edEstan.setValidation(true);
        }

        

     

        if (findError) {
            this.muestraError("Favor corregir la información según se indica.");
            return;
        }
   
        this.mensajeError.hide();        
            zPost("addSis.uv", { sistema: u })
                .then(sistema => {
                    this.cmdOk.enable();
                    this.loading.hide();
                    this.close(sistema)
                })
                .catch(error => this.showDialog("common/WError", { message: error.toString() }));
        
    }
}