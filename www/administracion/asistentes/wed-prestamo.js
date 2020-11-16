class CustomController extends ZCustomComponent {
    onThis_init(options) {
        this.documentoSelect=[]
        this.options = options;
     
        
        this.refresca();
        this.errorMsg.hide();       
        this.title.view.text("Detalles préstamo");
        let u = options.record;
  
        
        this.edRut.val = u.alumno_id;
        this.edBiblio.val= u.ubicacion
    
        let estado = [{id:0, nombre:'Activo'},{id:1, nombre:'Entregado'},{id:2, nombre:'Pendiente'}];
        this.edEstado.setRows(estado);
        if(u.estado.trim()=="Entregado"){
            this.errorMsg.show();   
            this.edEstado.val=1
            this.edEstado.disable()
        }else if(u.estado.trim()=="Pendiente"){
            this.edEstado.val=2
        }else{
            this.edEstado.val=0
        }

       
    }
   
    onCmdCancel_click() { this.cancel() }
    
  

    onCmdOk_click() {

       if(this.edEstado.val==1){
           let idx=this.options.record.idx
           zPost("Updateprestamo.uv", {id:idx,estado:"Entregado"})
           .then(result => {
            this.close(result)
        })          
       }else{
        this.close()  
       }
        
         
    }

    refresca() { this.listaPlandetalle.refresh()       }
  
    
    
   async onListaPlandetalle_getRows(cb) {         
     let products = await zPost("getlibros.uv", { id: this.options.record.idx })
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