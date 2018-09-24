var customEl = {};

// element: modal window
customEl.myModalContent = document.registerElement("my-modal-content",{
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.container = undefined;

            // private data
            this.data = {};

            // initialise
            elHide(this);
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},

        // methods
        autoClose : {value: function(type,val){
            if(type=="get") {
                val = this.getAttribute("auto-close");
                val = val? val: "1";

            } else if(type=="set") {
                if(val && val.length>0) {
                    this.setAttribute("auto-close",val);
                } else {
                    val = "1";
                }
            }
            return val;
        }},
        getContainer: {value: function () {
            if(!this.els.container) {
                this.els.container = document.getElementsByTagName("MY-MODAL");
                if(this.els.container.length>0) {
                    this.els.container = this.els.container[0];
                } else {
                    this.els.container = document.createElement("MY-MODAL")
                    document.body.appendChild(this.els.container);
                }
            }
            return this.els.container;
        }},
        showContent: {value: function () {
            var c = this.getContainer();
            c.setSource(this);
            elShow(c);
        }},
        hideContent: {value: function () {
            elHide(this.getContainer());
        }}
    })
})
// todo: signal needed here
customEl.myModal = document.registerElement("my-modal",{
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.container = undefined;
            this.els.closeButton = undefined;
            this.els.target = undefined;
            this.els.source = undefined;

            // private data
            this.data = {};

            // initialiser
            this.els.container = document.createElement("div");
            this.els.container.className = "my-modal-container";

            this.els.closeButton = document.createElement("div");
            this.els.closeButton.className = "my-modal-close";
            this.els.closeButton.innerHTML = "&times;"

            this.els.target = document.createElement("div");
            this.els.target.className = "my-modal-placeholder";

            this.els.container.appendChild(this.els.closeButton);
            this.els.container.appendChild(this.els.target);
            this.appendChild(this.els.container);

            // event handlers
            this.addEventListener("click",function(ev){
                var t = ev.target;
                var s = this.els.source;

                if(s.autoClose("get")=="1" && (this.isElButton(t) || this.isElCanvas(t)) ) {
                    s.hideContent();
                } else if (s.autoClose("get")=="0" && this.isElButton(t)) {
                    s.hideContent();
                }
            })
            
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},

        // methods
        isElCanvas: {value: function (e) {
            return this===e;
        }},
        isElButton: {value: function (e) {
            return this.els.closeButton && this.els.closeButton===e;
        }},
        moveContent: {value: function (s) {
            if(this.els.source && this.els.source!==s) {
                elMoveChildren(this.els.target,this.els.source);
            }
            elMoveChildren(s,this.els.target);
        }},
        setSource: {value: function (el) {
            this.moveContent(el);
            this.els.source = el;
        }}
    })
})

// element: warning text content
customEl.myMsg = document.registerElement("my-msg",{
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.frag = [];

            // private data
            this.data = {};
            this.data.generator = function () {
                return document.createElement("div");
            };

            // initialiser
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},

        // methods
        getChild: {value: function () {
            var el = this.els.frag.shift();
            if(!el) el = this.data.generator();
            return el;
        }},
        clearMsg: {value: function () {
            elRemoveChildren(this,this.els.frag);
        }},
        printArray: {value: function (arr,fnRender) {
            fnRender = fnRender || function (el,d) {
                el.innerHTML = d;
            }
            this.clearMsg();
            elsEach(arr,function(a) {
                var el = this.getChild();
                fnRender.call(this,el,a);
                this.appendChild(el);
            },this);
        }}
    })
})
customEl.myMsgValidate = document.registerElement("my-msg-validate",{
    prototype: Object.create(customEl.myMsg.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.frag = [];

            // private data
            this.data = {};
            this.data.generator = function () {
                return document.createElement("div");
            };

            // initialiser
            if(this.hookType("get")==="auto") this.hookTargets();
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
            this.unhookTargets();
        }},
        attributeChangedCallback: {value: function(name,oldval,newval) {
            if(name==="target-name"){
                this.unhookTargets();
                this.targetName("set",newval);
                this.hookTargets();
            }
        }},

        // attribute accessors
        targetName : {value: function(type,val){
            if(type=="get") {
                val = this.getAttribute("target-name");
                val = val? val: null;

            } else if(type=="set") {
                if(val && val.length>0) {
                    this.setAttribute("target-name",val);
                } else {
                    val = undefined;
                }
            }
            return val;
        }},
        hookType: {value: function (type,val) {
            if(type=="get") {
                val = this.getAttribute("hook-type");
                val = (val==="manual" || val==="auto")? val: "auto";

            } else if(type=="set") {
                if(val==="manual" ||val==="auto") {
                    this.setAttribute("hook-type",val);
                } else {
                    val = undefined;
                }
            }
            return val;
        }},

        // methods
        hookTargets: {value: function (namelist) {
            namelist = namelist || this.targetName("get") || "";
            var temp = namelist.split(",");

            for(var i=0;i<temp.length;i++) {
                applyEachGroup.call(this
                    ,temp[i]
                    ,undefined
                    ,function(el,index,list){ if(el) { el.setWarningEl(this) }; }
                )
            }
        }},
        unhookTargets: {value: function (namelist) {
            namelist = namelist || this.targetName("get") || "";
            var temp = namelist.split(",");

            for(var i=0;i<temp.length;i++) {
                applyEachGroup.call(this
                    ,temp[i]
                    ,undefined
                    ,function(el,index,list){ if(el) { el.setWarningEl(undefined) }; }
                )
            }
        }}
    })
})

// element: textbox
customEl.myTextbox = document.registerElement("my-textbox",{
    extends: "input",
    prototype: Object.create(HTMLInputElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.warningEl  = undefined;
            this.els.calendar   = undefined;

            // private data
            this.data = {};
            this.data.svalidated = new signals.Signal();
            this.data.validation = undefined;
            this.data.converted  = undefined;
            this.data.fnValue = function(ev){
                var el = ev.target;    
                el.setValue(el.value); 

                if( el.dataType("get")=="date" ) {
                    el.synchCalendar();
                }

                if(ev instanceof KeyboardEvent){
                    el.highlightContent();   
                }
            }
            this.data.debounce = new debounce();
            this.data.debouncedFn = this.data.debounce.setup(this,this.data.fnValue,1000);

            // initialiser
            this.type = "text";

            if( this.value.length>0 ) {
                this.setValue(this.value); 
            }

            // event handlers
            this.addEventListener("focus",function(ev){
                var el = ev.target;
                this.highlightContent();
            })
            this.addEventListener("blur",function(ev){
                //terminate
                this.data.debounce.terminate();
                this.data.fnValue(ev);

                var el = ev.target;
                if( el.hasAttribute("data-valid") ) {
                    el.validate();
                } else {
                    el.setValue(el.value);
                }
            })

            this.addEventListener("keydown",function(ev){
                this.data.debouncedFn(ev);
            });
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        // attribute accessors:
        dataType : {value: function(type,val){
            if(type=="get") {
                val = this.getAttribute("data-type");
                val = val? val: "text";

            } else if(type=="set") {
                if(val && val.length>0) {
                    this.setAttribute("data-type",val);
                } else {
                    val = undefined;
                }
            }
            return val;
        }},

        // methods
        setValue: {value: function(source,datatype) {
            if(source.constructor !== String) source = this.value;
            datatype = datatype || this.getAttribute("data-type");

            var f = new Formatter(source);
            f.pipeline(datatype)
            this.setAttribute("data-valid" ,f.isValid);
            this.setAttribute("data-mask"  ,f.datamask); 
            this.setAttribute("data-string",f.datastring);

            this.data.converted = f.data;
            this.value = f.datamask || f.source || "";

            this.validate();
            return this.getValue();
        }},
        getValue: {value: function () {
            //return this.data.converted;
            var d,dtype = this.dataType("get");
            d = this.data.converted;
            if(dtype==="date" && d) {
                d = this.data.converted.toISOString();
            }
            return d;
        }},
        setWarningEl: {value: function (el) {
            this.els.warningEl = el;
        }},
        getWarningEl: {value: function () {
            if(!this.els.warningEl) {
                this.els.warningEl = document.createElement("MY-MSG-VALIDATE")
                this.parentElement.insertBefore(
                    this.els.warningEl
                    ,this.nextSiblingElement
                );
            }
            return this.els.warningEl;
        }},
        showWarning: {value: function (warnings) {
            this.getWarningEl().printArray(warnings);
        }},
        getValidation: {value: function () {
            if(!this.data.validation) {
                this.data.validation = new Validate();
            }
            return this.data.validation;
        }},
        validate: {value: function (value) {
            var temp = this.getValidation().evalElement(this,value);
            //todo: event obj to propagate
            this.showWarning(temp.warnings);

            // dispatch items
            this.data.svalidated.dispatch(temp);
            //todo: evaluate use
            //xtag.fireEvent(this, 'validate', {detail: temp});
            return temp;
        }},
        onValidated: {value: function (fn) {
            this.data.svalidated.add(fn,this);
        }},
        highlightContent: {value: function () {
            var dtype = this.dataType("get");
            if( dtype=="date" || dtype=="money") {
                this.select();
            }
        }},

        // calendar related
        bindCalendar: {value: function (c) {
            this.data.calendar = c;

            this.synchCalendar();
            var rec  = this.getBoundingClientRect();
            c.style.marginTop  = rec.height+4+"px";
            c.style.marginLeft = 0+"px";

            elRemoveClassName(c,"hide");
            this.parentElement.insertBefore(c,this);
        }},
        unbindCalendar: {value: function () {
            elAppendClassName(this.data.calendar,"hide");
            this.data.calendar = undefined;
        }},
        getCalendar: {value: function (c) {
            return this.data.calendar;
        }},
        synchCalendar: {value: function () {
            if(this.dataType("get")=="date") {
                var dtselected = this.getValue();
                var dt   = dtselected===undefined? new Date(): new Date(dtselected);
                var dd   = dt.getDate();      
                var mm   = dt.getMonth();    
                var yyyy = dt.getFullYear(); 

                if(dtselected) {
                    this.getCalendar().setSelectedDate( yyyy,mm,dd );
                } else {
                    this.getCalendar().setSelectedDate();
                }
                this.getCalendar().renderScroller();
                this.getCalendar().render(yyyy,mm,dd);
            }
        }}
    })
})

// element: radio elements
customEl.myCheckboxRadio = document.registerElement("my-checkbox-radio",{
    extends:"input",
    prototype: Object.create(HTMLInputElement.prototype, {
        createdCallback:{value: function() {
            // element references
            this.els = {};
            this.els.warningEl = undefined;

            // private data
            this.data = {};
            this.data.svalidated = new signals.Signal();
            this.data.validation = undefined;

            // initialiser
            if(!this.type || this.type=="text") { this.type = "radio"; }

            this.addEventListener("change",function(ev){
                var el = ev.target;
                var list = this.getValue().join(",");
                if(this.type==="checkbox") {
                    this.setValue( 
                        el.checked? listAppendUnique( list, ev.target.value ): listRemove (list, ev.target.value)
                    );
                } else if(this.type==="radio") {
                    this.setValue(ev.target.value);
                }
            })
        }},
        attachedCallback: {value: function() {
            // todo: testing
            this.setValue();
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},

        // methods:
        setValue: {value: function(source,filter) {
            var targetVal = this.getValue(filter);
            if(targetVal) { 
                setValueByName(source,this.name,filter); 
                applyEachGroup.call(this
                    ,this.name
                    ,function(g,k){ return k == writeKey(this); }
                    ,function(el,index){ el.setAttribute("data-string",targetVal.join(",")); }
                )
            }
            this.validate();
            return targetVal;
        }},
        getValue: {value: function (filter) {
            var temp = this.name? getValueByName(this.name,filter): undefined;
            return temp;
        }},
        setWarningEl: {value: function (el) {
            this.els.warningEl = el;
        }},
        getWarningEl: {value: function () {
            if(!this.els.warningEl) {
                this.els.warningEl = document.createElement("MY-MSG-VALIDATE")
                this.parentElement.insertBefore(
                    this.els.warningEl
                    ,this.nextSiblingElement
                );
            }
            return this.els.warningEl;
        }},
        showWarning: {value: function (warnings) {
            this.getWarningEl().printArray(warnings);
        }},
        getValidation: {value: function () {
            if(!this.data.validation) {
                this.data.validation = new Validate();
            }
            return this.data.validation;
        }},
        validate: {value: function (value) {
            var temp = this.getValidation().evalElement(this,value);
            this.showWarning(temp.warnings);

            this.data.svalidated.dispatch(temp);
            return temp;
        }},
        onValidated: {value: function (fn) {
            this.data.svalidated.add(fn,this);
        }}
    })
})
// element: select
customEl.mySelect = document.registerElement("my-select",{
    extends:"select",
    prototype: Object.create(HTMLSelectElement.prototype, {
        createdCallback:{value: function() {
            // element references
            this.els = {};
            this.els.warningEl = undefined;

            // private data
            this.data = {};
            this.data.svalidated = new signals.Signal();
            this.data.validation = undefined;

            // event handlers
            this.addEventListener("change",function(ev) {
                var el = ev.target;
                var list = this.getValue().join(",");
                this.setValue(list);
            })
        }},
        setValue: {value: function(source,filter) {
            var targetVal = this.getValue(filter)
            if(targetVal) { 
                temp = true;
                setValueByName(source,this.name,filter); 
                applyEachGroup.call(this
                    ,this.name
                    ,function(g,k){ return k == writeKey(this); }
                    ,function(el,index){ el.setAttribute("data-string",targetVal.join(",")); }
                )
            }
            this.validate();
            return temp;
        }},
        getValue: {value: function (filter) {
            var temp = this.name? getValueByName(this.name,filter): undefined;
            return temp;
        }},
        setWarningEl: {value: function (el) {
            this.els.warningEl = el;
        }},
        getWarningEl: {value: function () {
            if(!this.els.warningEl) {
                this.els.warningEl = document.createElement("MY-MSG-VALIDATE")
                this.parentElement.insertBefore(
                    this.els.warningEl
                    ,this.nextSiblingElement
                );
            }
            return this.els.warningEl;
        }},
        showWarning:  {value: function (warnings) {
            this.getWarningEl().printArray(warnings);
        }},
        getValidation: {value: function () {
            if(!this.data.validation) {
                this.data.validation = new Validate();
            }
            return this.data.validation;
        }},
        validate: {value: function (value) {
            var temp = this.getValidation().evalElement(this,value);
            this.showWarning(temp.warnings);

            this.data.svalidated.dispatch(temp);
            return temp;
        }},
        onValidated: {value: function (fn) {
            this.data.svalidated.add(fn,this);
        }}
    })
})

// flexible table 
customEl.myTd = document.registerElement("my-td",{
    extends: "td",
    prototype: Object.create(HTMLTableCellElement.prototype, {
        createdCallback: {value: function() {
            // private data
            this.data = {};

            // initialiser
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        // methods
        setData: {value: function(d) {
            this.data = d;
        }},
        getData: {value: function() {
            return this.data;
        }},
        getPosition: {value: function() {
            var p = this;
            var pp = this.parentElement;
            var pos = {
                 xIndex: elIndex(p)
                ,yIndex: elIndex(pp)
            }
            if( p.hasAttribute("col-name")) { pos.colName = p.getAttribute("col-name"); }
            if(pp.hasAttribute("row-name")) { pos.rowName = p.getAttribute("row-name"); }
            return pos;
        }},

    })
})
customEl.myTh = document.registerElement("my-th",{
    extends: "th",
    prototype: Object.create(customEl.myTd.prototype)
})
customEl.myTr = document.registerElement("my-tr",{
    extends: "tr",
    prototype: Object.create(HTMLTableRowElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.cached = [];

            // private data
            this.data = {};
            this.data.fnGenerate = function (td,data,key,list) {
                return td? td: document.createElement("td","my-td");
            }
            this.data.fnData = function (td,data,key,list) {
                td.setAttribute("col-name",key);
                td.setData(data);
            }
            this.data.fnRender = function (td,data,key,list) {
                td.textContent = td.getData();
            }
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        // methods
        cacheEls: {value: function () {
            while(this.lastElementChild) {
                this.els.cached.unshift( this.removeChild(this.lastElementChild) );
            }
        }},
        setPipeline: {value: function (fnGenerate,fnData,fnRender) {
            this.data.fnGenerate = (fnGenerate && fnGenerate.constructor===Function? fnGenerate: this.data.fnGenerate);
            this.data.fnData     = (fnData     &&     fnData.constructor===Function? fnData    : this.data.fnData    );
            this.data.fnRender   = (fnRender   &&   fnRender.constructor===Function? fnRender  : this.data.fnRender  );
        }},
        renderData: {value: function (source) {
            var pipeline = function (td,data,key,list) {
                td = this.data.fnGenerate.call(this,td,data,key,list);
                this.appendChild(td);
                this.data.fnData.call(this,td,data,key,list);
                this.data.fnRender.call(this,td,data,key,list);
            }
            this.cacheEls();
            if(source.constructor===Array) {
                for(var i=0; i<source.length; i++) 
                    pipeline.call(this,this.els.cached.shift(),source[i],i,source);

            } else if(source.constructor===Object) {
                for(var i in source) 
                    pipeline.call(this,this.els.cached.shift(),source[i],i,source);
            }
        }},
        getData: {value: function () {
            var target = undefined;
            elsEach(this.children,function(el,index,all){
                var t = el.getPosition();
                if(isNaN(t.colName)) {
                    if(!target) target = {};
                    target[t.colName] = el.getData();
                } else {
                    if(!target) target = [];
                    target.push(el.getData());
                }
            })
            return target; 
        }},
        getPosition: {value: function () {
            var p = this;
            var pos = {
                yIndex: elIndex( p )
            }
            if(this.hasAttribute("row-name")) {
                pos.rowName = this.getAttribute("row-name");
            }
            return pos;
        }}
    })
})
customEl.myTbody = document.registerElement("my-tbody",{
    extends: "tbody",
    prototype: Object.create(HTMLTableSectionElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.container = undefined;
            this.els.cached = [];

            // private data
            this.data = {};

            // initialiser
            this.data.fnGenerate = function (tr,data,key,list) {
                return tr? tr: document.createElement("tr","my-tr");
            };
            this.data.fnData = function (tr,data,key,list) {
                tr.setAttribute("row-name",key);
            };
            this.data.fnRender = function (tr,data,key,list) {
                tr.renderData(data);
            };
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        // methods
        cacheEls: {value: function () {
            while(this.lastElementChild) {
                this.els.cached.unshift( this.removeChild(this.lastElementChild) );
            }
        }},
        setPipeline: {value: function (fnGenerate,fnData,fnRender) {
            this.data.fnGenerate = (fnGenerate && fnGenerate.constructor===Function? fnGenerate: this.data.fnGenerate);
            this.data.fnData     = (fnData     &&     fnData.constructor===Function? fnData    : this.data.fnData    );
            this.data.fnRender   = (fnRender   &&   fnRender.constructor===Function? fnRender  : this.data.fnRender  );
        }},
        renderData: {value: function (source) {
            var pipeline = function (tr,data,key,list) {
                tr = this.data.fnGenerate.call(this,tr,data,key,list);
                this.appendChild(tr);
                this.data.fnData.call(this,tr,data,key,list);
                this.data.fnRender.call(this,tr,data,key,list);
            }
            this.cacheEls();
            if(source.constructor===Array) {
                for(var i=0; i<source.length; i++) 
                    pipeline.call(this,this.els.cached.shift(),source[i],i,source);

            } else if(source.constructor===Object) {
                for(var i in source) 
                    pipeline.call(this,this.els.cached.shift(),source[i],i,source);
            }
        }}
    })
})
customEl.myTable = document.registerElement("my-table",{
    extends:"table",
    prototype: Object.create(HTMLTableElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.container = undefined;

            // initialiser
            this.els.thead = this.getElementsByTagName("THEAD");
            if(this.els.thead>0) {
                this.els.thead = this.els.tbody[0].firstElementChild;
            } else {
                this.els.thead = document.createElement("TR","my-tr");
                var temp  = document.createElement("THEAD");
                temp.appendChild(this.els.thead);
                this.append(temp);
            }
            this.headPipeline(
                function(td,data,index,list){
                    return td? td: document.createElement("TH","my-th");
                }
                ,undefined
                ,undefined
            );

            // table body
            this.els.tbody = this.getElementsByTagName("TBODY");
            if(this.els.tbody>0) {
                this.els.tbody = this.els.tbody[0];
            } else {
                this.els.tbody = document.createElement("TBODY","my-tbody");
                this.append(this.els.tbody);
            }

            // private data
            this.data = {};
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        // methods
        renderData: {value: function (d) {
            //data format: cf query
            this.els.thead.renderData( d.COLUMNS );
            this.els.tbody.renderData( d.DATA );
        }},
        headPipeline: {value: function (fnGen,fnData,fnRender) {
            this.els.thead.setPipeline(fnGen,fnData,fnRender);
        }},
        bodyPipeline: {value: function (fnGen,fnData,fnRender) {
            this.els.tbody.setPipeline(fnGen,fnData,fnRender);
        }}
    })
})

// alternating date key, value
function Scroller () {
    this.currPos = 0;
    this.items = [];
    for(var i=0;i<arguments.length;i++) {
        this.items.push(arguments[i]);
    }
}
Scroller.prototype.push     = function (addition)  { this.items.push(addition); }
Scroller.prototype.unshift  = function (addition)  { this.items.unshift(addition); }
Scroller.prototype.setPos   = function (pos)       { this.currPos = pos; }
Scroller.prototype.setItem  = function (item)      {
    var pos = -1;
    for(var i=0; i<this.items.length; i++) {
        var c = this.items[i];
        if(c===item) {
            pos = i;
            this.setPos(i);
            break;
        }
    }
    return pos;
}
Scroller.prototype.getItem  = function ()          { return this.items[this.currPos]; }
Scroller.prototype.scroll   = function (direction) {
    direction = direction? direction: 1;
    this.currPos = this.currPos + (direction<0? -1: 1);
    var loopback = 0;
    var len = this.items.length;

    if(this.currPos>=len) {
        this.currPos = 0;
        loopback = 1;

    } else if(this.currPos<0) {
        this.currPos = len-1;
        loopback = -1
    }
    return loopback;
}

// calendar functions
function getOffset(dt,weekstartday,weeklength) {
    var dddd = dt.getDay();
    var dd = dt.getDate();
    var mm = dt.getMonth();
    var yyyy = dt.getFullYear();

    weeklength = (weeklength===undefined || weeklength===null)? 7: weeklength;
    weekstartday = (weekstartday===undefined || weekstartday===null)? 0: weekstartday; //0:sunday,1:monday,2:tuesday,etc
    var tempback,weeksback = 0;
    var limit = -1;
    do {
        tempback = dd-dddd +weekstartday -weeklength*weeksback;
        if(tempback<=limit) {
            break;
        }
        weeksback++;
    } while(tempback>limit) 
    return dateAdd("dd",-dddd+weekstartday-weeklength*weeksback,new Date(yyyy,mm,dd));
}

// calendar
function Calendar(dt,weekstartday) {
    this.date = dt; 
    this.weekstartday = weekstartday;
    this.weekstartday = 1;
    this.data = [
         ["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
        ,["","","","","","",""]
    ];
}
Calendar.prototype.setup = function (dt,weekstartday) {
    this.date = dt; 
    this.weekstartday = weekstartday;
    this.setData();
}
Calendar.prototype.dateSet = function (yyyy,mm,dd) {
    if(dd  !==undefined) this.date.setDate(dd);
    if(mm  !==undefined) this.date.setMonth(mm);
    if(yyyy!==undefined) this.date.setFullYear(yyyy);
    this.setData();
}
Calendar.prototype.dateGet = function () {
    return this.date;
}
Calendar.prototype.dateAdd = function (type,interval) {
    dateAdd(type,interval,this.date);
    this.setData();
}
Calendar.prototype.listWeekdays = function (d,len) {
    len = len? len: "short"; //"normal","long"
    var days = [
        "sun-day"
        ,"mon-day"
        ,"tue-s-day"
        ,"wed-nesday"
        ,"thu-rs-day"
        ,"fri-day"
        ,"sat-urday"
    ];
    var temp,count = this.weekstartday;
    while(count>0) {
        days.push(days.shift());
        count--;
    }
    if( !(d===undefined || d===null) ) {
        days = [ days[d] ];
    }
    var result;
    if(len=="short")       { result = elsMap(days,function(el,index,list){ var temp = el.split("-"); return temp[0];}); }
    else if(len=="normal") { result = elsMap(days,function(el,index,list){ var temp = el.split("-"); temp.pop(); return temp.join("");}); }
    else if(len=="long")   { result = elsMap(days,function(el,index,list){ var temp = el.split("-"); return temp.join("");}); }
    return result;
}
Calendar.prototype.getStrMonth = function (m,len) {
    len = len? len: 3;
    m = m || this.date.getMonth();
    var mm = ['january'
        ,'february'
        ,'march'
        ,'april'
        ,'may'
        ,'june'
        ,'july'
        ,'august'
        ,'september'
        ,'october'
        ,'november'
        ,'december'
    ];
    return capitalise( mm[m].substr(0,len) );
}
Calendar.prototype.getStrYear = function () {
    return this.date.getFullYear();
}
Calendar.prototype.getStrDate = function (dt,type) {
    dt = dt || this.date;
    type = type || "short";
    var result = [];
    if(type==="short") {
        result.push( 
            this.getStrMonth(dt.getMonth()) 
            ,dt.getFullYear()
        );
    }
    return result.join(" ")
}
Calendar.prototype.setData = function () {
    var temp = getOffset(this.date,this.weekstartday);
    var dd = temp.getDate();
    var mm = temp.getMonth();
    var yyyy = temp.getFullYear();
    var eom = daysInMonth(mm,yyyy);
    var dtnext = dd;

    //rows
    for(var j=0;j<this.data.length;j++) {
        // columns
        for(var i=0;i<this.data[j].length;i++) {
            if(dtnext>=eom) {
                dd = -1*(j*7+i)+1;
                mm = mm+1;
                if(mm>11) {
                    yyyy = yyyy+1;
                    mm = 0;
                }
                eom = daysInMonth(mm,yyyy)
            }
            dtnext = (j*7+i)+dd;
            this.data[j][i] = yyyy.toString()+pad0(mm,2)+pad0(dtnext,2);
        }
    }
}
Calendar.prototype.getData = function () {
    return this.data;
}

// calendar manager
function CalendarManager () {
    this.scroller = new Scroller();
    this.maxItems = 10;
}
CalendarManager.prototype.add = function () {
    var toAdd = this.scroller.items.length<this.maxItems;
    if(toAdd) {
        this.scroller.push( document.createElement("MY-CALENDAR") );
    }
    return toAdd;
}

CalendarManager.prototype.isHidden = function (targetCal) {
    var isPinned = targetCal.pinned("get")=="1";
    var augInput = targetCal.getAugmentedInput();
    return !isPinned && augInput;
}
CalendarManager.prototype.isInputAug = function (el) {
    var c = this.scroller.getItem();
    return c && (
        elIs(el,{tagName:"INPUT",type:"text"})
        && el.getAttribute("is")==="my-textbox"
        && el.dataType("get")==="date" 
        && el===c.getAugmentedInput()
    );
}
CalendarManager.prototype.isCalendarAug = function (el) {
    return el.tagName==="MY-CALENDAR" || elGetParent(el,{tagName:"MY-CALENDAR"})!==null;
}
CalendarManager.prototype.isCalendarPin = function (el) {
    return listHas(el.className,"pin"," ");
}

CalendarManager.prototype.hideCalendar = function (targetCal) {
    if(!targetCal) return false;
    var toHide = this.isHidden(targetCal);
    var augInput = targetCal.getAugmentedInput();

    //clear bindings
    if(toHide) {
        augInput.unbindCalendar();
        targetCal.unbindInput();
    }
    return toHide;
}
CalendarManager.prototype.hide = function () {
    for(var i=0;i<this.scroller.items.length;i++) {
        var item = this.scroller.items[i];
        this.hideCalendar(item);
    }
}
CalendarManager.prototype.getHiddenCalendar = function () {
    var els = []; 
    for(var i=0;i<this.scroller.items.length;i++) {
        var item = this.scroller.items[i];
        if(!item.getAugmentedInput()) {
            els.push(item);
        }
    }
    return els;
}
CalendarManager.prototype.getNextCalendar = function () {
    var c, c1;

    this.hide();
    c = this.getHiddenCalendar();
    if(c.length>0) { 
        c1 = c[0];
        this.hideCalendar( this.scroller.getItem() );
        this.scroller.setItem(c1);
        return c1;
    }

    if(this.add()) { 
        return this.getNextCalendar(); 
    } else {
        // max reached
        return undefined;
    }
}
CalendarManager.prototype.augmentInput = function (el) {
    var cal = el.getCalendar();
    if(cal) {
        this.hideCalendar( this.scroller.getItem() );
        this.scroller.setItem(cal);
    } else {
        cal = this.getNextCalendar();
        cal.bindInput(el);
        el.bindCalendar(cal);
    }
    this.zIndexSorting();
}
CalendarManager.prototype.zIndexSorting = function () {
    // zIndex reserved: 900-999
    var itop    = this.maxItems-1;
    var ibottom = 900;

    var z;
    var c = this.scroller.getItem();
    z = c.style.zIndex;
    c.style.zIndex = itop;

    for(var i=0;i<this.scroller.items.length;i++) {
        var item = this.scroller.items[i];
        if(item===c) continue;

        if( !this.isHidden(item) && item.style.zIndex>z) {
            item.style.zIndex = item.style.zIndex-1;
        }

        //todo: proper handling of index pushed out of reserved range
        if(item.style.zIndex<900) {
        }
    }
}

// custom element: calendar
customEl.myCalendar = document.registerElement("my-calendar",{
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.container = undefined;

            // private data
            this.data = {};

            // initialiser
            this.init()
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        // methods
        init: {value: function () {
            innerHTML(this, '<div class="indicator"> <div class="button pin">&#x1f4cc;</div> <div class="mid"> <span class="scrollkey"> </span> <span class="scrollval"> </span> </div> <div class="button"> </div> </div> <div class="indicator"> <input type="button" class="button" value="&laquo;"> <div class="mid"> <span class="mm"> </span> <span class="yyyy"> </span> </div> <input type="button" class="button" value="&raquo;"> </div> <table> <thead> <tr is="my-tr"> </tr> </thead> <tbody is="my-tbody"> </tbody> </table>' )

            this.data.dtselected = undefined;
            this.data.dtnow = new Date();
            this.data.dtnow.setHours(0,0,0,0);
            this.data.scroller = new Scroller(
                 { key:"today"   ,val: function(){ return this.data.dtnow; }}
                ,{ key:"selected",val: function(){ return this.data.dtselected; }} 
            );

            // initialising today's date
            this.data.cal = new Calendar(new Date());
            this.data.cal.setData();

            this.els.head = this.getElementsByTagName("THEAD")[0].firstElementChild;
            this.els.head.renderData(
                elsMap(this.data.cal.listWeekdays(),function(el) { return capitalise(el)}, this)
            )

            this.els.skin = this.getElementsByTagName("TBODY")[0];
            var fnRender = (function (calendar) {
                return function(tr,data,key,list) {
                    var dtx = calendar.data.dtnow;
                    tr.setPipeline(
                        undefined
                        ,function(td,data,index,list) {
                            var temp = {}
                            temp.yyyy = data.substr(0,4);
                            temp.mm = data.substr(4,2);
                            temp.dd = data.substr(6,2);
                            td.setData(temp);
                        }
                        ,function(td,data,index,list) {
                            td.textContent = Number(td.getData().dd);
                        }
                    )
                    tr.className="dates"
                    tr.renderData(data);
                }
            })(this)
            this.els.skin.setPipeline(
                undefined
                ,undefined
                ,fnRender
            );

            var inputs = this.getElementsByTagName("input");
            var spans = this.getElementsByTagName("span");
            var divs = this.getElementsByTagName("div");
            this.els.elPrev     = inputs[0];
            this.els.elNext     = inputs[1];
            this.els.elPin      = divs[1];
            this.els.elDayType  = spans[0];
            this.els.elDayValue = spans[1];
            this.els.elmm       = spans[2];
            this.els.elyyyy     = spans[3];

            this.els.augmentedEl = undefined;
            this.pinned("set","0");
            this.render();
            this.renderScroller();

            // event handlers
            this.addEventListener("click",function(ev){
                var t = ev.target;
                var tc = ev.currentTarget;

                if( t===this.els.elPin ) {
                    var pinNext = this.pinned("get")==="0"? "1": "0";
                    this.pinned("set", pinNext);
                }
                else if( t===this.els.elPrev )     { this.data.cal.dateAdd("mm",-1);this.render(); }
                else if( t===this.els.elNext )     { this.data.cal.dateAdd("mm",1);this.render(); }
                else if( t===this.els.elDayType )  { 
                    this.data.scroller.scroll(); 
                    this.renderScroller();

                } else if( t===this.els.elDayValue ) { 
                    var dt = this.data.scroller.getItem().val.call(this); 
                    var dd   = dt.getDate();      
                    var mm   = dt.getMonth();    
                    var yyyy = dt.getFullYear(); 
                    this.render(yyyy,mm,dd);

                } else if( t.tagName==="TD") {
                    var d = t.getData();
                    if(elHasClassName(t.parentElement,"dates")){
                        if(elHasClassName(t,"selected")) {
                            this.setSelectedDate();
                            elRemoveClassName(t,"selected");
                        } else {
                            this.setSelectedDate(d.yyyy,d.mm,d.dd);
                            elAppendClassName(t,"selected");
                        }
                        this.synchInput();
                    }
                    this.render();
                    this.renderScroller();
                    
                    // event dispatch
                    this.dispatchEvent(new CustomEvent("dtselected",{
                        details: {
                            selected: this.data.dtselected
                            ,cell: t
                        }
                    }))
                }
            })
        }},
        pinned : {value: function(type,val){
            if(type=="get") {
                val = this.getAttribute("pinned");
                val = val? val: "text";

            } else if(type=="set") {
                if(val && val.length>0) {
                    this.setAttribute("pinned",val);
                } else {
                    val = undefined;
                }
            }
            return val;
        }},
        getSelectedDate: {value: function () {
            var result;
            if(this.data.dtselected){
                result = {};
                result.yyyy = this.data.dtselected.getFullYear();
                result.mm   = this.data.dtselected.getMonth();
                result.dd   = this.data.dtselected.getDate();
            }
            return result;
        }},
        setSelectedDate: {value: function (yyyy,mm,dd) {
            if( yyyy===undefined && mm===undefined && dd===undefined ){
                this.data.dtselected = undefined;

            } else {
                if(!this.data.dtselected){
                    this.data.dtselected = new Date();
                }
                if(dd  !==undefined) this.data.dtselected.setDate(dd);
                if(mm  !==undefined) this.data.dtselected.setMonth(mm);
                if(yyyy!==undefined) this.data.dtselected.setFullYear(yyyy);
                this.data.dtselected.setHours(0,0,0,0);
            }
        }},
        render: {value: function (yyyy,mm,dd) {
            this.renderData(yyyy,mm,dd);
            this.renderMMYYYY();
            this.layerStyles();
        }},
        renderData: {value: function (yyyy,mm,dd) {
            if( yyyy!==undefined || mm!==undefined || dd!==undefined ) {
                this.data.cal.dateSet(yyyy,mm,dd);
            }
            this.els.skin.renderData(this.data.cal.getData());
        }},
        renderMMYYYY: {value: function () {
            var d = this.data.cal;
            this.els.elmm.textContent = d.getStrMonth()
            this.els.elyyyy.textContent = d.getStrYear()
        }},
        renderScroller: {value: function () {
            var curr = this.data.scroller.getItem(); 
            var dt = curr.val.call(this);
            this.els.elDayType.textContent = curr.key.toUpperCase();
            this.els.elDayValue.textContent = dt? dateFormat(dt): "";
        }},
        layerStyles: {value: function () {
            //layer style classes
            var last,lastDt,currdata,classes="";
            var dt1=new Date();
            dt1.setHours(0,0,0,0);

            var tds,trs = this.els.skin.children;
            for(var i=0;i<trs.length;i++){
                var last = trs[i].lastElementChild;
                var lastDt = last.getData();

                var toStyleSelected = function(d) { return this.data.dtselected? dateCompare(d,this.data.dtselected): 1; }
                var toStyleToday    = function(d) { return dateCompare(d,this.data.dtnow); }
                var toStylePrev     = function(d) { return this.data.cal.dateGet().getMonth()>Number(d.mm); }
                var toStyleNext     = function(d) { return this.data.cal.dateGet().getMonth()<Number(d.mm); }

                tds = trs[i].children;
                for(var j=0;j<tds.length;j++) {
                    currdata = tds[j].getData();
                    dt1.setDate     (currdata.dd  );
                    dt1.setMonth    (currdata.mm  );
                    dt1.setFullYear (currdata.yyyy);
                    classes = 
                         (toStyleSelected.call(this,dt1)===0? "selected ": "")
                         +(toStyleToday.call(this,dt1)===0? "today ": "")
                         +(toStylePrev.call(this,currdata)? "mprev ": "")
                         +(toStyleNext.call(this,currdata)? "mnext ": "");
                     tds[j].className = classes;
                }
            }
        }},
        bindInput: {value: function (el) {
            this.els.augmentedEl = el;
        }},
        unbindInput: {value: function () {
            this.els.augmentedEl = undefined;
        }},
        getAugmentedInput: {value: function () {
            return this.els.augmentedEl;
        }},
        synchInput: {value: function () {
            var input = this.getAugmentedInput();
            if(input){
                var dt = this.data.dtselected;
                if(!dt) {
                    input.setValue("");
                } else {
                    input.setValue(dateFormat(dt));
                }
            }
        }},
    })
})
// TODO: keyboard manager to the whole body
customEl.myBase = document.registerElement("my-base",{
    extends:"body",
    prototype: Object.create(HTMLBodyElement.prototype, {
        createdCallback: {value: function() {
            // element references
            this.els = {};
            this.els.target = undefined;

            // private data
            this.data = {};

            // initialiser
            this.data.calman = new CalendarManager();

            // event listener
            this.addEventListener("click",function(ev){
                var mcal = this.getManager("calendar");
                var t = ev.target;

                var isElCalendar    = mcal.isCalendarAug(t);
                var isElCalendarPin = mcal.isCalendarPin(t); 
                var isInputDate     = mcal.isInputAug(t); 
                var elP = isElCalendar? elGetParent(t,{tagName:"MY-CALENDAR"}): undefined;

                // calendar: clicked calendar/ input || clicked pin tab of pinned calendar  
                if( (!isElCalendar && !isInputDate) || (isElCalendar && isElCalendarPin && mcal.isHidden(elP)) ){
                    mcal.hide();

                } else if(isElCalendar) {
                    mcal.scroller.setItem(elP);
                    mcal.zIndexSorting();
                }
            })
            this.addEventListener("focus",function(ev){
                var mcal = this.getManager("calendar");
                var t = ev.target;

                var isInputDate = elIs(t,{tagName:"INPUT",type:"text"}) 
                    && t.getAttribute("is")==="my-textbox"
                    && t.dataType("get")==="date";

                if(isInputDate) {
                    mcal.augmentInput(t);
                } else {
                    mcal.hide();
                }
            },true)

        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        getManager: {value: function (type) {
            var m;
            if(type==="calendar") m=this.data.calman;
            return m;
        }}
    })
})



// xtags["my-textbox"] = xtag.register("my-textbox",{
//     extends:"input",
//     lifecycle:{
//         created: function () { 
//             this.init();
//         },
//         inserted: function () { },
//         removed: function () { },
//         attributeChanged: function (attr,old,next) { },
//     },
//     methods: {
//         init: function () {
//             this.type = "text";
//             this.xtag.data.warningEl  = undefined;
//             this.xtag.data.svalidated = new signals.Signal();
//             this.xtag.data.validation = undefined;
//             this.xtag.data.calendar   = undefined;
//             this.xtag.data.converted  = undefined;
// 
//             if( this.value.length>0 ) {
//                 this.setValue(this.value); 
//             }
//         },
//         setValue: function(source,datatype) {
//             if(source.constructor !== String) source = this.value;
//             datatype = datatype || this.dataType;
// 
//             var f = new Formatter(source);
//             f.pipeline(datatype)
//             this.dataValid  = f.isValid;
//             this.dataMask   = f.datamask; 
//             this.dataString = f.datastring;
// 
//             this.xtag.data.converted = f.data;
//             this.value      = f.datamask || f.source || "";
// 
//             this.validate();
//             return this.getValue();
//         },
//         getValue: function () {
//             return this.xtag.data.converted;
//         },
//         setWarningEl: function (el) {
//             this.xtag.data.warningEl = el;
//         },
//         getWarningEl: function () {
//             if(!this.xtag.data.warningEl) {
//                 this.xtag.data.warningEl = document.createElement("MY-MSG-VALIDATE")
//                 this.parentElement.insertBefore(
//                     this.xtag.data.warningEl
//                     ,this.nextSiblingElement
//                 );
//             }
//             return this.xtag.data.warningEl;
//         },
//         showWarning: function (warnings) {
//             this.getWarningEl().printArray(warnings);
//         },
//         getValidation: function () {
//             if(!this.xtag.data.validation) {
//                 this.xtag.data.validation = new Validate();
//             }
//             return this.xtag.data.validation;
//         },
//         validate: function (value) {
//             var temp = this.getValidation().evalElement(this,value);
//             //todo: event obj to propagate
//             this.showWarning(temp.warnings);
// 
//             // dispatch items
//             this.xtag.data.svalidated.dispatch(temp);
//             xtag.fireEvent(this, 'validate', {detail: temp});
//             return temp;
//         },
//         onValidated: function (fn) {
//             this.xtag.data.svalidated.add(fn,this);
//         },
//         getCalendar: function (c) {
//             return this.xtag.data.calendar
//         },
//         synchCalendar: function () {
//             if(this.dataType==="date") {
//                 var dtselected = this.getValue();
//                 var dt   = dtselected || new Date();
//                 var dd   = dt.getDate();      
//                 var mm   = dt.getMonth();    
//                 var yyyy = dt.getFullYear(); 
// 
//                 if(dtselected) {
//                     this.xtag.data.calendar.setSelectedDate( yyyy,mm,dd );
//                 } else {
//                     this.xtag.data.calendar.setSelectedDate();
//                 }
//                 this.xtag.data.calendar.renderScroller();
//                 this.xtag.data.calendar.render(yyyy,mm,dd);
//             }
//         },
//         bindCalendar: function (c) {
//             this.xtag.data.calendar = c;
// 
//             this.synchCalendar();
//             var rec  = this.getBoundingClientRect();
//             c.style.marginTop  = rec.height+4+"px";
//             c.style.marginLeft = 0+"px";
// 
//             elRemoveClassName(c,"hide");
//             this.parentElement.insertBefore(c,this);
//         }
//         ,unbindCalendar: function () {
//             elAppendClassName(this.xtag.data.calendar,"hide");
//             this.xtag.data.calendar = undefined;
//         }
//         ,highlightContent: function () {
//             if(this.dataType=="date") {
//                 this.select();
//             }
//         }
//     },
//     accessors: {
//         // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
//         dataValid:{attribute:{}, },
//         dataMask:{attribute:{}, },
//         dataString:{attribute:{}, },
//         dataType:{attribute:{}, get: function() {
//             var temp = this.getAttribute("data-type");
//             return temp? temp: "text";
//         }}
//     },
//     events: {
//         "focus": function(ev){
//             this.highlightContent();
//         },
//         "blur": function(ev){
//             var el = ev.target;
//             if( el.hasAttribute("data-valid") ) {
//                 el.validate();
//             } else {
//                 el.setValue(el.value);
//             }
//             el.synchCalendar();
//         },
//         "keydown": debounce(this,function(ev){
//             var el = ev.target;    
//             el.setValue(el.value); 
//             el.synchCalendar();    
//             el.highlightContent();   
//         },800)
//     }
// })

// looping text
customEl.myMsgLoop = document.registerElement("my-msg-loop",{
    prototype: Object.create(HTMLElement.prototype,{
        createdCallback: {value: function() {
            // element references
            this.els = {};

            // private data
            this.data = {};
            this.data.looper = new looper();
            this.data.fn = undefined;

            // initialiser
        }},
        attachedCallback: {value: function() {
            this.els.div = document.createElement("DIV");
            this.appendChild(this.els.div);
        }},
        detachedCallback: {value: function() {
        }},
        attributesChangedCallback: {value: function() {
        }},

        // methods
        showMsg : {value: function(type,val){
            if(type=="get") {
                val = this.getAttribute("show-msg");
                val = val? val: "hide";

            } else if(type=="set") {
                if(val && val.length>0) {
                    this.setAttribute("show-msg",val);
                } else {
                    val = undefined;
                }
            }
            return val;
        }},
        getLooper: {value: function () {
            return this.data.looper;
        }},
        printText: {value: function(t){
            this.els.div.textContent = t;
        }},
        setupLoop: {value: function (text,interval) {
            interval = interval || 1000;
            var div = this.els.div;
            this.data.fn = this.data.looper.setup({t:text, dots:"."}, function(){
                var tdots = this.t+this.dots;
                if(this.dots.length>10) {
                    this.dots = ".";
                } else {
                    this.dots = this.dots+".";
                }
                div.textContent = tdots;
            },interval);
        }},
        startLoop: {value: function() {
            this.data.fn();
        }},
        stopLoop: {value: function() {
            this.data.looper.terminate();
        }}
    })
})
customEl.myAjax = document.registerElement("my-ajax",{
    prototype: Object.create(HTMLElement.prototype,{
        createdCallback: {value: function() {
            // element references
            this.els = {};

            // private data
            this.data = {};

            // initialiser
            this.data.msgtxt = { };
            this.data.msgtxt["ready"     ] = function () { return "Connecting"; }
            this.data.msgtxt["connected" ] = function () { return "Connecting" ; }
            this.data.msgtxt["responded" ] = function () { return this.method=="GET"? "Getting"    : this.method=="POST"?"Posting" :"Sending"; }
            this.data.msgtxt["processing"] = function () { return this.method=="GET"? "Loading"    : this.method=="POST"?"Saving"  :"Loading"; }
            this.data.msgtxt["success"   ] = function () { return this.method=="GET"? "Data loaded": this.method=="POST"?"Saved"   :"Success"; }
            this.data.msgtxt["error"     ] = function () { return "Error"     ; }
            this.data.dots = "";
            this.data.maxLen = 9;

            this.data.msgloop = document.createElement("MY-MSG-LOOP");
            this.appendChild(this.data.msgloop);
        }},
        attachedCallback: {value: function() {
        }},
        detachedCallback: {value: function() {
        }},
        attributeChangedCallback: {value: function() {
        }},
        composeHandlerWithMsg: {value: function (handler) {
            var scope = this;
            var c = function (key) {
                var f = handler[key];
                return function () {
                    if(key=="success" || key=="error") {
                        scope.data.msgloop.stopLoop();
                        scope.data.msgloop.printText(scope.data.msgtxt[key]());
                    } else {
                        scope.data.msgloop.setupLoop(scope.data.msgtxt[key]());
                        scope.data.msgloop.startLoop();
                    }
                    if(f) f.apply(scope,arguments);
                }
            }
            var newHandler = {};
            for(var key in handler) {
                newHandler[key] = c(key);
            }
            return newHandler;
        }},
        fire: {value: function (data,success,error,ready,connected,responded,processing) {
            return ajax({method:this.method(), action:this.action(), params:data||{} }, this.composeHandlerWithMsg({
                 "ready"     : ready     
                ,"connected" : connected 
                ,"responded" : responded 
                ,"processing": processing
                ,"success"   : success   
                ,"error"     : error     
            }) );
        }},
        method: {value: function(){
            var m = this.getAttribute("method");
            return m? m: "GET"
        }},
        action: {value: function(){
            var a = this.getAttribute("action");
            return a? a: "http://"
        }},
    })
})

//
// proposed to discard
// // formatter
// xtag.register("my-regex",{
//     lifecycle:{
//         created: function () {},
//         inserted: function () {},
//         removed: function () {},
//         attributeChanged: function (attr,old,next) {}
//     },
//     methods: {
//         getDefinition: function () {
//             var filtered = elsFilter(this.attributes, function(attr){
//                 return new RegExp("^params").test(attr.nodeName);
//             });
//             var result = {regex:undefined, str:"", flags:"gi", fnName:"", fn:"function(match){ return match;}" }
//             for(var i=0;i<filtered.length;i++) {
//                 var n = filtered[i].nodeName;
//                 var v = filtered[i].nodeValue;
// 
//                 n = n.split("-");
//                 var n0 = n.shift();
//                 var n1 = camelCase(n);
//                 if(n0==="params"){ result[n1]=v; } 
//             }
//             if(result.str.length>0) {
//                 result.regex = new RegExp(result.str,result.flags);
//             }
//             if(result.fnName.length>0) {
//                 result.fnReplace = window[result.fnName];
// 
//             } else {
//                 result.fnReplace = new Function ("return "+result.fn)();
//             }
//             return result;
//         }
//     },
//     accessors: {
//         // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
//     },
//     events: {
//     }
// })
// xtag.register("my-format",{
//     lifecycle:{
//         created: function () { },
//         inserted: function () { },
//         removed: function () {},
//         attributeChanged: function (attr,old,next) {},
//     },
//     methods: {
//         refreshRegexes: function () {
//             var temp = elsMap(elChildren(this,{tagName:"MY-REGEX"}), function(el){
//                 var result;
//                 if(el.getDefinition) {
//                     result = el.getDefinition();
//                 }
//                 return result;
//             });
//             return temp;
//         }
//         ,formatByRegexes: function (source) {
//             var regexes,fmt; 
//             if(this.type && Formatter.presets.hasOwnProperty(this.type)) {
//                 regexes = Formatter.presets[this.type];
//             } else {
//                 regexes = this.refreshRegexes();
//             }
//             fmt = new Formatter(regexes).format(source);
//             return {isFormatted:(fmt? true: false), target: (fmt? fmt: source)};
//         }
//         ,formatEl: function (name) {
//             var temps = getValueByName(name);
//             var textEls = ["input.text","input.textarea"];
//             var result = {};
//             for(var t in temps) {
//                 if(textEls.indexOf(t)>-1) {
//                     result[t] = elsMap(temps[t], function(v){
//                         var f = this.formatByRegexes( v );
//                         return f.isFormatted? f.target: v;
//                     },this)
//                 }
//             }
//             setValueByName(result,name);
//         }
//     },
//     accessors: {
//         // attrname:{attribute:{}, get: function(val) {}, set: function(val) {}}
//         type:{attribute:{} }
//         ,name:{attribute:{}
//             , get: function() { var n = this.getAttribute("name"); return n? n: "base";}
//             , set: function(val) {return val; } 
//         }
//         ,handleOn:{attribute:{}
//             , get: function() { var n = this.getAttribute("handleOn"); return n? n: "pre";} 
//             , set: function(val) { return val; } 
//         }
//     },
//     events: {
//     }
// })
// 
// 
