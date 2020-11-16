class CustomController extends ZCustomComponent {
    onThis_init() {
      
        this.refresca();
    }

    onEdFiltro_change() { this.refresca() }
    refresca() { this.listaUsuarios.refresh() }


    onListaUsuarios_getRows(cb) {
        let filtro = {
            filtro: this.edFiltro.val.trim() 
        }
        zPost("getUsuarios.seg", {zToken:window.zSecurityToken,filtro:filtro}, usuarios => {

            cb(usuarios);
        });
    }
   
    onCmdAgregarUsuario_click() {
        this.showDialog("./wed-usuario", {newRecord:true}, usuario => this.refresca());
    }
    onListaUsuarios_editRequest(idx, row) {
        this.showDialog("./wed-usuario", {record:row}, usuario => {
            this.refresca()
        });
    }
    onListaUsuarios_ResponsiveColumnShow(idx, row) {
        this.listaUsuarios.ResponsiveColumnShow(idx, row);
    }

    onListaUsuarios_ResponsiveColumnHide(idx, row) {
        this.listaUsuarios.ResponsiveColumnHide(idx, row);
    }
    onListaUsuarios_deleteRequest(idx, row) {
        this.showDialog("common/WConfirm", {message:"¿Confirma que desea eliminar el usuario '" + row.nombre + "'?"}, () => {
           
            zPost("deleteUsuario.seg", {zToken:window.zSecurityToken,usuario:row,loginModificacion: window.app.sesion.usuario.login})
                .then(() => {
                    this.listaUsuarios.deleteRow(idx);
                })
                .catch(error => this.showDialog("common/WError", {message:error.toString()}));
        });
    }    
}