class CustomController extends ZCustomComponent {

async onThis_init(){

 this.toDate.hide();
 this.documentoSelect=[]
 $('select').selectpicker();
    this.refresca();
    $.extend($.fn.dataTable.defaults, {
        searching: false,
        ordering: false
    });
    await this.initDates();
    

}

async initDates() {
    /* set current date (today in both) */
    var today = new Date();

    $('input[name="dates"]').daterangepicker({
      
        locale: {
            cancelLabel: 'Clear'
        },
        autoApply: true,
        showDropdowns: true,
        minYear: 2010,
        maxYear: today.getFullYear()

    });
    
    $('input[name="dates"]').on('apply.daterangepicker', (ev, picker) => {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        this.fromDate.value = picker.startDate.format('DD/MM/YYYY');
        this.toDate.value= picker.endDate.format('DD/MM/YYYY');    
        var table = $('#listaPlanes').DataTable();
        table.clear().destroy();
        $('#biblio').selectpicker('val', '');
        $('#biblio').selectpicker('refresh');
        this.edFiltro.val=""
        this.refresca()
    });
  
    $('input[name="dates"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
   

}
onBiblio_change(){
    this.fromDate.value = ""
    this.toDate.value=""

    this.edFiltro.val=""
    var table = $('#listaPlanes').DataTable();
    table.clear().destroy();
    this.refresca()

}
onEdFiltro_change() { 
    this.fromDate.value = ""
    this.toDate.value=""
    $('#biblio').selectpicker('val', '');
    $('#biblio').selectpicker('refresh');
    
    var table = $('#listaPlanes').DataTable();
    table.clear().destroy();
    this.refresca() 
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
            let existe = this.documentoSelect.find(e => e.id == row.idx)
            edDetalle = 
            "<div class='button text-center'><label style='line-height:0.6;'>" +
                "<button class='activo-toggler' data-id-idx ='"+row.idx+"' type='button' "+ (existe ? ' checked':'')+">" +
                "<span aria-hidden='true'><i class='fa fa-edit'></i></span></button>" +
            "</label></div>";
           
            row.edDetalle = edDetalle;
            return row;

           
        }
        async preparaHandlersFilas() {
            this.listaPlanes.view.find(".activo-toggler").click(e => {
                let codigo = $(e.currentTarget).data("id-idx"); 
                zPost("getOnePrestamo.uv", {id:codigo})
               .then((x)=>{
                   console.log(x)
                   let row={
                       alumno_id:x[0].alumno_id,
                       estado:x[0].estado,
                       idx:x[0].idx,
                       ubicacion:x[0].ubicacion
                   }
                  // console.log(row)
                this.showDialog("./wed-prestamo", { record: row }, planes => {
                    var table = $('#listaPlanes').DataTable();
                table.clear().destroy();
                    this.refresca();
                    })
                 //console.log(x)
                })
                 
            });
    
        }
        onListaPlanes_ResponsiveColumnShow(idx, row) {
            this.listaPlanes.ResponsiveColumnShow(idx, row);
        }
    
        onListaPlanes_ResponsiveColumnHide(idx, row) {
            this.listaPlanes.ResponsiveColumnHide(idx, row);
        }
        onListaPlanes_getRows(cb) {
           this.message=[]
            var selected = $('#biblio').val()
            if(selected){
                var filtro = {
                    filtro: selected
                }
                this.message=selected

            }else{
                var filtro = {
                    filtro: this.edFiltro.val.trim()
                }
                this.message=""
            }
            if(this.toDate.value){
                this.message= "("+this.fromDate.value+ "-" + this.toDate.value+")"
                zPost("getAllprestamosDate.uv", {from:this.fromDate.value,to:this.toDate.value}, planes => {
                    //  console.log(planes)
                      planes.forEach(d => this.preparaFila(d));
                      cb(planes);
                      $("#listaPlanes").DataTable({
                          retrieve: true,
                          "paging": true,
                          "info": false,
                          "lengthChange": false,
                          responsive: "true",
                          dom: 'Bfrtilp',
                          "language": {
                              "zeroRecords": " ",
                              "paginate": {
                                  "previous": "<<",
                                  "next": ">>"
                              }
                          },
                          buttons: [
                              {
                                  extend: 'excelHtml5',
                                  exportOptions: {
                                  columns: [0,1,2,3,4]
                              },
                                  //text:'<i class "fas fa-file-excel"></i>',
                                  titleAttr: 'Excel',
                                  filename: 'Autopréstamos',
                                  className: 'btn btn-success',
                                   message:this.message,
                                   filename: 'Autopréstamos ' + this.message
                                   //title: '',
                              }
                          ]
                      })
          
                  });

            }else{
                zPost("getAllprestamos.uv", {filtro:filtro}, planes => {
                    //  console.log(planes)
                      planes.forEach(d => this.preparaFila(d));
                      cb(planes);
                      $("#listaPlanes").DataTable({
                          retrieve: true,
                          "paging": true,
                          "info": false,
                          "lengthChange": false,
                          responsive: "true",
                          dom: 'Bfrtilp',
                          "language": {
                              "zeroRecords": " ",
                              "paginate": {
                                  "previous": "<<",
                                  "next": ">>"
                              }
                          },
                          buttons: [
                              {
                                  extend: 'excelHtml5',
                                  exportOptions: {
                                  columns: [0,1,2,3,4]
                              },
                                  //text:'<i class "fas fa-file-excel"></i>',
                                  titleAttr: 'Excel',
                                  filename: 'Autopréstamos',
                                  className: 'btn btn-success',
                                   message:this.message,
                                   filename: 'Autopréstamos ' + this.message
                                  // title: '',
                              }
                          ]
                      })
          
                  });

            }
            

         
           
        }
 
        async onListaPlanes_afterPaint() {
            this.preparaHandlersFilas();
        }
        onListaPlanes_editRequest(idx, row) {
            this.showDialog("./wed-prestamo", { record: row }, planes => {
                this.refresca();
            });
        }
    

}