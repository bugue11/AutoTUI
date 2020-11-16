class CustomController extends ZCustomComponent {

    async onThis_init() {
        this.mensajeImportando.hide()
        this.cmdConfirm.hide()
        this.cmdLibros.hide()
        this.cmdConfirm.hide()
        this.cmdCancel.hide()
        this.documentoSelect = []
        this.libros = []
        this.listaInvoiceContainer2.hide()
        onScan.attachTo(document);
        this.test=[]
        // let col = await zPost("getalumno.uv",{})
        // console.log(col)
        // Register event listener


        // this.refresca2();
       // this.view.bootstrapMaterialDesign();

        let message1 = "<h3 align=center>¡Bienvenido al sistema de autopréstamo bibliotecario!</h3>"
        message1 += "<p align=center style=font-size:18px>Seleccione la opción que desea realizar</p>"
        this.prueba1.view.html(message1);
        // this.tui()
    }
    validatelibros(x) {
       // console.log(x)
        if (this.libros.length < 3) {
             let doc = {
                 idx: x.idx,
                autor: x.autor,
                 cod:x.cod,
                 nombre: x.nombre,
                 tipo:x.tipo,
                 posicion: this.libros.length
             }
            // console.log(doc)
            this.libros.push(doc)
            // this.libros.map(e=>{
            //     nombre: e.nombre
            // })
           console.log(this.libros)
        } else {
            this.showDialog("common/WInfo", { message: "Ha alcanzado el límite de libros" })
        }

    }

    onCmdCancel_click() {
        this.showDialog("common/WConfirm", { message: "¿Está seguro que desea cancelar el autopréstamo?" },(x)=>{
            location.reload();
        })

        
    }
    async onCmdInit_click() {
        this.alumno = []
        this.cmdInit.hide()
        this.users = []
        this.name = []
        let message = "<h3 align=center>Paso 1</h3>"
        message += "<p align=center style=font-size:18px>Porfavor acerque su tarjeta TUI al lector para comenzar su autopréstamo </p>"
        this.prueba1.view.html(message);

        var rut = await zPost("tuirut.uv", {})
        this.detalles.hide()
        this.mensajeImportando.show()
        console.log(rut.trim())
        if (rut.trim().length > 10) {
            this.showDialog("common/WError2", { message: "La tarjeta utilizada no es válida" })
        } else {
            let temp = rut.trim()
            if (temp.includes('b') == true) {
                rut = temp.replace("b", "k")
            }
            console.log(rut)
            await zPost("getalumno.uv", { cod: rut }, x => {

                if (typeof x == 'object') {
                    this.alumno = x
                    this.tui(this.alumno.nombre.trim())
                } else {
                    this.showDialog("common/WError2", { message: x })
                }


            })
        }
    }


    async tui(name) {
        this.mensajeImportando.hide()
        let message2 = "<h3 align=center>¡Datos validados!</h3>"
        message2 += "<p align=center style=font-size:18px>Hola " + name + " ,Presiona el botón para agregar los libros que desea</p>"
        this.prueba1.view.html(message2);
        this.detalles.show()
        this.cmdLibros.show()

        // this.scanlibros()

    }

    onCmdLibros_click() {
        this.cmdLibros.hide()
        this.cmdCancel.show()
        let message3 = "<h3 align=center>Paso 2</h3>"
        message3 += "<p align=center style=font-size:18px>Por favor escanear los libros. Recuerde que el máximo son 3</p>"
        this.prueba1.view.html(message3)
        //this.listaInvoiceContainer2.show()
        document.addEventListener('scan', sScancode => {
            // this.detalles2.hide()
            zPost("getBarcode.uv", { code: sScancode.detail })
                .then(x => {
                    if (x != false) {
                      // console.log(x)
                        this.validatelibros(x);
                        this.listaInvoiceContainer2.show()
                        this.cmdConfirm.show()
                        
                        this.refresca2()
                    } else {
                        this.showDialog("common/WInfo", { message: "El código escaneado no pertenece a la Biblioteca" })
                    }
                })

        });

    }
    onCmdConfirm_click() {
        this.record=[]
        this.showDialog("common/WConfirm", { message: "¿Confirma su selección de libros?" }, () => {
            zPost("insertPrestamo.uv", { alumno: this.alumno, libros: this.libros })
                .then((x) => {
                    console.log(x)
                    let doc={
                        ubicacion: x[0].ubicacion,
                        nombre: this.alumno.nombre,
                        libros:x

                    }
                    console.log(doc)
                   this.showDialog("./wed-prestamo", { record: doc })
                })
                .catch(error => this.showDialog("common/WError2", { message: error.toString() }));

        });
    }
    refresca2() {

        this.listaComponentes.refresh(); this.documentoSelect = []
    }




    onListaComponentes_ResponsiveColumnShow(idx, row) {
        this.listaComponentes.ResponsiveColumnShow(idx, row);

    }
    onListaComponentes_ResponsiveColumnHide(idx, row) {
        this.listaComponentes.ResponsiveColumnHide(idx, row);

    }


    preparaFila(row) {
        delete row._rowClass;
        let edDetalle;
        delete row._rowClass;
        let existe = this.documentoSelect.find(e => e.id == row.posicion)
        edDetalle =
            "<div class='button  text-center'><label style='line-height:0.6;'>" +
            "<button  class='activo-toggler' data-id-posicion ='" + row.posicion + "' type='button' " + (existe ? ' checked' : '') + ">" +
            "<span aria-hidden='true'><i class='fa fa-trash'></i></span></button>" +
            "</label></div>";

        row.edDetalle = edDetalle;
        return row;


    }
    async preparaHandlersFilas() {
        this.listaComponentes.view.find(".activo-toggler").click(e => {
            let codigo = $(e.currentTarget).data("id-posicion");
            console.log(codigo)
           for(let i in this.libros){
               if(this.libros[i].posicion==codigo)
               this.libros.splice(i, 1);
           }
            
           if(this.libros.length==0){
            this.listaInvoiceContainer2.hide()
            this.cmdConfirm.hide()
           }
            console.log(this.libros)
            this.refresca2()
        
         //   console.log(this.libros.idx.indexOf(codigo))
            //     zPost("getOnePrestamo.uv", {id:codigo})
            //    .then((x)=>{
            //        //console.log(x)
            //        let row={
            //            alumno_id:x[0].alumno_id,
            //            estado:x[0].estado,
            //            idx:x[0].idx
            //        }
            //        console.log(row)
            //     this.showDialog("./wed-prestamo", { record: row }, planes => {
            //         this.refresca();
            //         })
            //      //console.log(x)
            //     })

        });

    }
     async onListaComponentes_afterPaint() {
         this.preparaHandlersFilas();
     }
    onListaComponentes_getRows(cb) {
       //console.log(this.libros)
        let book = this.libros
        book.forEach(d => this.preparaFila(d));
        cb(book);

    }

}

