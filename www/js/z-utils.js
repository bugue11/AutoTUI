function validaEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(email)) {
		return false;
	}
	return true;
}

function generateRandomToken(length) {
	var chars = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var st = "";
	for (var i=0; i<length; i++) {
		st += chars.charAt(parseInt(Math.random() * chars.length));
	}
	return st;
}

function formateaFechaHora(dt) {
	var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
	var dd = dt.getDate();
	var MM = meses[dt.getMonth()];
	var yyyy = dt.getFullYear();
	var hh = dt.getHours();
	var mm = dt.getMinutes();
	return (dd < 10?"0":"") + dd + "/" + MM + "/" + yyyy + " " + (hh<10?"0":"") + hh + ":" + (mm<10?"0":"") + mm;
}

function formateaFecha(dt) {
	var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
	var dd = dt.getDate();
	var MM = meses[dt.getMonth()];
	var yyyy = dt.getFullYear();
	return (dd < 10?"0":"") + dd + "/" + MM + "/" + yyyy;
}

function formateaNumero(n, c, d, t){
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d === undefined ? "." : d, 
    t = t === undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 }

function formateaRut(numero, dv) {
    var st = "";
    var stN = "" + numero;
    var n = 0;
    for (var i=stN.length - 1; i>=0; i--) {
        var c = stN.charCodeAt(i);
        if (c >= 48 && c <= 57) {
            if (n++ % 3 == 0 && st.length > 0) st = "." + st;
            st = stN.charAt(i) + st;
        }
    }
    return st + "-" + dv;		
}

function validaRut(rutCompleto) {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) return false;
    var tmp = rutCompleto.split('-');
    var digv = tmp[1];
    var rut = tmp[0];
    if (digv == 'K') digv = 'k';
    return (calculaDV(rut) == digv);
}
function calculaDV(T) {
    var M = 0, S = 1;
    for (; T; T = Math.floor(T / 10))
        S = (S + T % 10 * (9 - M++ % 6)) % 11;
    return S ? S - 1 : 'k';
}

function object2datetime(o) {
    return new Date(o.ano, o.mes, o.dia, o.hora, o.minuto, o.segundo);
}
