$(document).ready(function(){
    var scion = require('scion');

    var scxmlContent = $('#scxmlContent'),
        scxmlLoadInitControls = $('#scxmlLoadInitControls'),
        loadFromFileButton = $('#loadFromFileButton'),
        loadScxmlFromField = $('#loadScxmlFromField'),
        initScxmlButton = $('#initScxmlButton'),
        scxmlTrace = $('#scxmlTrace'),
        scxmlSimulationControls = $('#scxmlSimulationControls'),
        eventNameField = $('#eventNameField'),
        logOnentryCheckbox = $('#logOnentry')[0],
        logOnexitCheckbox = $('#logOnexit')[0];


    var codeMirror = CodeMirror.fromTextArea(scxmlContent[0], window.location.search.match(/keyMap=vim/) ? {keyMap:'vim'} : undefined);

    codeMirror.setValue('<scxml initial="start" version="1.0" xmlns="http://www.w3.org/2005/07/scxml"><!--   node-size-and-position x=0 y=0 w=910 h=820  -->\n'+
'    <state id="start"><!--   node-size-and-position x=81.36 y=43 w=75 h=75  -->\n'+
'     <onentry>\n'+
'      <send delay="1s" event="tick"></send>\n'+
'      <script>all_off()</script>\n'+
'     </onentry>\n'+
'     <transition event="tick" target="lights"><!--   edge-path [lights]  pointx=0 pointy=0 offsetx=-84 offsety=0  --></transition>\n'+
'    </state>\n'+
'    <parallel id="new_node26"><!--   node-size-and-position x=260 y=40 w=380 h=700  -->\n'+
'     <history id="H*" type="deep"><!--   node-size-and-position x=20 y=43 w=75 h=75  --></history>\n'+
'     <state id="lights" initial="red"><!--   node-size-and-position x=169.61 y=120 w=160.5 h=513  -->\n'+
'      <transition event="pause" target="turn_off"></transition>\n'+
'      <state id="green"><!--   node-size-and-position x=20 y=293 w=75 h=75  -->\n'+
'       <onentry>\n'+
'        <send delay="5s" event="tick"></send>\n'+
'        <script>green()</script>\n'+
'       </onentry>\n'+
'       <transition event="tick" target="yellow"></transition>\n'+
'      </state>\n'+
'      <state id="yellow"><!--   node-size-and-position x=54 y=418 w=75 h=75  -->\n'+
'       <onentry>\n'+
'        <send delay="1s" event="tick"></send>\n'+
'        <script>yellow()</script>\n'+
'       </onentry>\n'+
'       <transition event="tick" target="red"><!--   edge-path [red]  x=125.5 y=330.5 x=125.5 y=205.5  --></transition>\n'+
'      </state>\n'+
'      <state id="greensoon"><!--   node-size-and-position x=20 y=168 w=75 h=75  -->\n'+
'       <onentry>\n'+
'        <send delay="1s" event="tick"></send>\n'+
'        <script>green_soon()</script>\n'+
'       </onentry>\n'+
'       <transition event="tick" target="green"></transition>\n'+
'      </state>\n'+
'      <state id="red"><!--   node-size-and-position x=54 y=43 w=75 h=75  -->\n'+
'       <onentry>\n'+
'        <send delay="5s" event="tick"></send>\n'+
'        <script>red()</script>\n'+
'       </onentry>\n'+
'       <transition event="tick" target="greensoon"></transition>\n'+
'      </state>\n'+
'     </state>\n'+
'    </parallel>\n'+
'    <state id="turn_off"><!--   node-size-and-position x=80.36 y=440 w=75 h=75  -->\n'+
'     <onentry>\n'+
'      <script>\n'+
'   \n'+
'   all_off()\n'+
'      </script>\n'+
'     </onentry>\n'+
'     <transition event="resume" target="H*"></transition>\n'+
'    </state>\n'+
'   </scxml>');

    var scxmlInstance;

    function trace(txt){
        var p = document.createElement('p');
        p.setAttribute('style','display:none');
        $(p).text(txt);
        scxmlTrace.append(p);
        $(p).show();
        scxmlTrace.scrollTop(scxmlTrace.scrollTop()+1000);
    }

    var listener = {
        onEntry : function(stateId){
            if(logOnentryCheckbox.checked) trace('entering ' + stateId);
        },
        onExit : function(stateId){
            if(logOnexitCheckbox.checked) trace('exiting ' + stateId);
        }
    };

    //add behaviour
    scxmlLoadInitControls.submit(function(e){
        e.preventDefault();
        var pathToScxml = loadScxmlFromField.val();
        //AJAX GET it
        //TODO: error handling
        $.get(pathToScxml,function(scxmlText){
            codeMirror.setValue(scxmlText);
        },"text");
    });

    loadFromFileButton.click(function() {
        var x = document.getElementById("loadFromFile");

        var reader = new FileReader();

        reader.onload = function(event){
            var file = event.target;
            codeMirror.setValue(file.result);
        };

        reader.readAsText(x.files[0]);

    });

    initScxmlButton.click(function(){
        //read the content and load it up
        scion.documentStringToModel(codeMirror.getValue(),function(err,model){
            if(err){ 
                alert(err.message);
                throw err;
            }

            //clean up othe rinstance, if it exists
            if(scxmlInstance){
                scxmlInstance.unregisterListener(listener);
            } 

            scxmlInstance = new scion.SCXML(model);
            scxmlInstance.registerListener(listener); 

            var conf = scxmlInstance.start();
            
            trace('started new scxml instance >> ' + JSON.stringify(conf));
        });
    });

    scxmlSimulationControls.submit(function(e){
        e.preventDefault();

        if(!scxmlInstance){
            var err = new Error('SCXML interpreter not loaded');
            alert(err.message);
            throw err;
        }

        var eventName = eventNameField.val(); 
        var conf = scxmlInstance.gen(eventName); 

        trace(eventName + ' >> ' + JSON.stringify(conf));

        eventNameField.val(''); 
    }); 

});