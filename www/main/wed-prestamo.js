class CustomController extends ZCustomComponent {
    async onThis_init(options) {
        this.libros=[]
        this.options = options;
        let u = options.record;
        console.log(u)

        this.edAlumno.val = u.nombre;
          this.edBiblio.val = u.ubicacion

          this.libros= u.libros
          console.log(this.libros)
       
       
        this.refresca();  
    }
   
    onCmdOk_click() {
       
        location.reload();      
    }

    refresca() { this.listaLib.refresh()       }
    
    
   async onListaLib_getRows(cb) {            
    
            cb(this.libros)
            
    }

   
    
   
    async deleteHandlersFilas() {
        this.listaLib.view.find(".activo-toggler").click(e => {
            let codigo = $(e.currentTarget).data("id-codigo"); 
            zPost("deleteProduct.imp", {cod:codigo})
            .then(() => {
                this.refresca();
            })
            .catch(error => this.showDialog("common/WError", { message: error.toString() }));         
        });

    }
    
   async onListaLib_afterPaint() {
        this.deleteHandlersFilas();
    }
    onListaLib_ResponsiveColumnShow(idx, row) {
        this.listaLib.ResponsiveColumnShow(idx, row);
    }

    onListaLib_ResponsiveColumnHide(idx, row) {
        this.listaLib.ResponsiveColumnHide(idx, row);
    }
   
    
  
    
   
}