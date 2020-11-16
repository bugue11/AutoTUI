class CustomController extends ZCustomComponent {

async onThis_init(){
 this.documentoSelect=[]
    this.refresca();
}

onEdFiltro_change() { this.refresca() }


onCmdAgregarSis_click() {
    this.showDialog("./add-sistema", {newRecord:true}, sistema => this.refresca());

}
        refresca(){ this.listaPlanes.refresh();this.documentoSelect = []}


        onListaPlanes_ResponsiveColumnShow(idx, row) {
            this.listaPlanes.ResponsiveColumnShow(idx, row);
          
        }
        onListaPlanes_ResponsiveColumnHide(idx, row) {
            this.listaplanes.ResponsiveColumnHide(idx, row);
         
        }

        preparaFila(row) {
            delete row._rowClass;
            let edDetalle;
            delete row._rowClass;
            let existe = this.documentoSelect.find(e => e.id == row.sis_id)
            edDetalle = 
            "<div class='button text-center'><label style='line-height:0.6;'>" +
            "<button class='activo-toggler' data-id-sis_id ='"+row.sis_id+"' type='button' "+ (existe ? ' checked':'')+">" +
            "<span aria-hidden='true'><i class='fa fa-edit'></i></span></button>" +
        "</label></div>";
           
            row.edDetalle = edDetalle;
            return row;
        }
        async preparaHandlersFilas() {
            this.listaPlanes.view.find(".activo-toggler").click(e => {
                let codigo = $(e.currentTarget).data("id-sis_id");
        
             zPost("getOneSistema.uv", {id:codigo})
            .then((x)=>{
           console.log(x)
                    let row={
                        sis_id:x[0].sis_id,
                        Estado:x[0].Estado,
                        Biblioteca:x[0].Biblioteca
                   }
                this.showDialog("./wed-sistema", { record: row }, planes => {
                    this.refresca();
                     })
                 })
                 
            });
    
        }

        async onListaPlanes_afterPaint() {
            this.preparaHandlersFilas();
        }
        onListaPlanes_getRows(cb) {
            let filtro = {
                filtro: this.edFiltro.val.trim()
            }

            zPost("getAllsistemas.uv", {filtro:filtro}, planes => {
                cb(planes);
            });
        }

        onListaPlanes_editRequest(idx, row) {
            this.showDialog("./wed-sistema", { record: row }, planes => {
                this.refresca();
            });
        }
        onListaPlanes_deleteRequest(idx, row) {
            this.showDialog("common/WConfirm", {message:"¿Confirma que desea eliminar el AutoTUI '" + row.sis_id + "'?. Los préstamos que estén activos en este sistema aún se podrán editar pero recuerde cambiar en el config.js el id del Auto TUI borrado"}, () => {
               
                 zPost("deleteSis.uv", {id:row.sis_id})
                     .then(() => {
                         this.listaPlanes.deleteRow(idx);
                     })
                     .catch(error => this.showDialog("common/WError", {message:error.toString()}));
            });
        } 
    

}