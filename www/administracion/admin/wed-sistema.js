class CustomController extends ZCustomComponent {
    onThis_init(options) {
        this.documentoSelect=[]
        this.options = options;
        this.refresca();
        this.errorMsg.hide();          
        let u = options.record;
        this.title.view.text("Préstamos realizados en AutoTUI  '"+u.sis_id+"'");
       this.edBiblio.val= u.Biblioteca
        this.edEstado.val = u.Estado;
        
       
    }
   
    onCmdOk_click() {    
       this.close()         
    }

    refresca() { this.listaPlandetalle.refresh()       }
  
    
    
   async onListaPlandetalle_getRows(cb) { 
       console.log(this.options.record.idx)           
     let products = await zPost("getPrestamos.uv", { id: this.options.record.sis_id })
            console.log(products)
            products.forEach(d => this.deleteFila(d));
            cb(products)
            
    }

   
    
    deleteFila(row) {
        let edDetalle;
        delete row._rowClass;
        let existe = this.documentoSelect.find(e => e.CODIGO == row.CODIGO)
        edDetalle = 
        "<div class='togglebutton text-center'><label style='line-height:0.6;'>" +
            "<input class='activo-toggler' data-id-codigo ='"+row.CODIGO+"' type='checkbox' "+ (existe ? ' checked':'')+">" +
            "   <span class='fa fa-trash'></span>" +
        "</label></div>";
       
        row.edDetalle = edDetalle;
        return row;
    }
    async deleteHandlersFilas() {
        this.listaPlandetalle.view.find(".activo-toggler").click(e => {
            let codigo = $(e.currentTarget).data("id-codigo"); 
            zPost("deleteProduct.imp", {cod:codigo})
            .then(() => {
                this.refresca();
            })
            .catch(error => this.showDialog("common/WError", { message: error.toString() }));         
        });

    }
    
   async onListaPlandetalle_afterPaint() {
        this.deleteHandlersFilas();
    }
    onListaPlandetalle_ResponsiveColumnShow(idx, row) {
        this.listaPlandetalle.ResponsiveColumnShow(idx, row);
    }

    onListaPlandetalle_ResponsiveColumnHide(idx, row) {
        this.listaPlandetalle.ResponsiveColumnHide(idx, row);
    }
     preparaFila(row) {
        let edDetalle;
        delete row._rowClass;
        let existe = this.documentoSelect.find(e => e.CODIGO == row.CODIGO)
        edDetalle = 
        "<div class='togglebutton text-center'><label style='line-height:0.6;'>" +
            "<input class='activo-toggler' data-id-codigo ='"+row.CODIGO+"' type='checkbox' "+ (existe ? ' checked':'')+">" +
            "   <span class='toggle'></span>" +
        "</label></div>";
       
        row.edDetalle = edDetalle;
        return row;
    }
    registraHandlersFilas() {
        this.listaProduct.view.find(".activo-toggler").change(e => {
            let c = $(e.currentTarget).prop("checked")?true:false;
            let codigo = $(e.currentTarget).data("id-codigo"); 
            let idx = this.listaProduct.rows.findIndex(r => r.CODIGO == codigo);
            if (idx < 0) return;
            let r = this.listaProduct.rows[idx];
            if(this.documentoSelect.find(e => e.CODIGO == r.CODIGO)){
                this.documentoSelect = this.documentoSelect.filter(e => e.CODIGO != r.CODIGO);
            }else{
                this.documentoSelect.push(r);
            }
            (this.documentoSelect.length) ? this.cmdAdd.enable() : this.cmdAdd.disable()
        });

    }
    
    
   
}