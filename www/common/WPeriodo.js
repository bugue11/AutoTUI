class CustomController extends ZCustomComponent {
    onThis_init(options) {
        this.edFechaInicio.val = options.periodo.fechaInicio;
        this.edFechaTermino.val = options.periodo.fechaTermino;
    }
    onCmdCancel_click() {this.cancel()}
    onCmdOk_click() {
        this.edFechaInicio.view.parent().removeClass("has-danger");
        this.edFechaTermino.view.parent().removeClass("has-danger");
        let valido = true;        
        let fechaInicio = this.edFechaInicio.val;
        let fechaTermino = this.edFechaTermino.val;
        if (fechaTermino.getTime() < fechaInicio.getTime()) {
            this.edFechaTermino.view.parent().addClass("has-danger");
            valido = false;
        }
        if (!valido) return;
        this.close({fechaInicio:fechaInicio, fechaTermino:fechaTermino});
    }
}