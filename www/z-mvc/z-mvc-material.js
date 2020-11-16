zShowDialog = (url, options, component, okCallback, cancelCallback) => {    
    let cnt = $("body").find("#dialogs-container");
    if (!cnt || !cnt.length) {
        $("body").append("<div id='dialogs-container'></div>");
        cnt = $("body").find("#dialogs-container");
    }
    let dialogUrl = zComposeURL(url, component.basePath);
    let p = dialogUrl.lastIndexOf("/");
    let dialogId = p >= 0?dialogUrl.substring(p+1):dialogUrl;
    let newBasePath = p >= 0?dialogUrl.substring(0,p):"";
    zLoadComponent(dialogUrl)
        .then(({html, controllerClass}) => {                
            let subview = $(html);
            if (!subview.prop("id")) subview.prop("id", dialogId);
            dialogId = subview.prop("id");
            cnt.append(subview);
            let dialogElement = cnt.find("#" + dialogId);                
            var exports = {};
            try {
                eval(controllerClass + "\nexports.customController = CustomController;");
            } catch(error) {
                console.error(error);
                throw(error);
            }
            if (!exports.customController) {
                throw("Declared class name in controller must be 'CustomController'");
            }
            let controller = new exports.customController(dialogElement, null, newBasePath);
            let dialog = new mdc.dialog.MDCDialog(dialogElement[0]);
            controller._dialog = dialog;
            controller._okCallback = okCallback;
            controller._cancelCallback = cancelCallback;
            dialog.listen('MDCDialog:accept', () => {
                // Close with no results ... pass controller
                if (okCallback) okCallback(controller);
                subview.remove();
            })
            dialog.listen('MDCDialog:cancel', () => {
                if (controller._closeFromController) return; // ignore if close() or cancel() from controller
                // Close with no results ... pass controller
                if (cancelCallback) cancelCallback(controller);
                subview.remove();
            })
            controller.init(options)
                .then(() => {
                    dialog.show();
                })
                .catch(error => {throw(error)});
        })
        .catch(error => onError(error));    
}

zCloseDialog = (component, result) => {
    if (!component._dialog) throw "Component is not a dialog";
    if (component._okCallback) component._okCallback(result);
    component._closeFromController = true;
    component._dialog.close();
    component.view.remove();
}
zCancelDialog = (component) => {
    if (!component._dialog) throw "Component is not a dialog";
    if (component._cancelCallback) component._cancelCallback();
    component._closeFromController = true;
    component._dialog.close();
    component.view.remove();
}

/*
class BootstrapTabs extends ZComponent {
    get selectedId() {return this._selectedId}
    set selectedId(id) {
        let a = this.view.find("a[href='#" + id + "']");
        if (!a || !a.length) throw "No tab found with id '" + id + "'";
        $(a).tab("show");
        this._selectedId = id;
    }
    get selected() {return this.container[this._selectedId]}
    set selected(cmp) {this.selectedId = cmp.id}
    onThis_init() {
        // find initial active tab
        let selected = this.view.find("a.active");
        if (!selected || !selected.length) throw "Can't find selected tab";
        this._selectedId = this.getTabId(selected.prop("href"));
        this.view.find("a").on("shown.bs.tab", e => {
            this._selectedId = this.getTabId($(e.target).prop("href"));
            this.triggerEvent("change", [this._selectedId]);
        });
    }
    getTabId(href) {
        let p = href.indexOf("#");
        if (p >= 0) return href.substring(p+1);
        return null;
    }
}
*/

class MCButton extends ZComponent {
    onThis_init() {
        mdc.ripple.MDCRipple.attachTo(this.view[0]);
    }
}
zRegisterDOMFactory("BUTTON", (e, container, basePath) => {
    if (e.hasClass("z-ripple")) return new MCButton(e, container, basePath);
});

class MCInput extends ZInput {
    constructor(domElement, container, basePath) {
        super(domElement, container, basePath);
        if (this.view.parent() && this.view.parent().hasClass("mdc-text-field")) {
            this._ed = new mdc.textField.MDCTextField(this.view.parent()[0]);
        }  
    }
    get ed() {return this._ed}
    get val() {return this.ed.value}
    set val(v) {this.ed.value = v}
}
zRegisterDOMFactory("INPUT", (e, container, basePath) => {
    return new MCInput($(e), container, basePath);    
})

/*
zRegisterDOMFactory("UL", (e, container, basePath) => {
    if (e.hasClass("nav") && e.hasClass("nav-tabs")) {
        if (e.find("[data-toggle='tab']").length > 0) {
            return new BootstrapTabs(e, container, basePath);
        }
    }
});
*/