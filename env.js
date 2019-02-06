$(document).ready(function(){
    //var scion = require('scion');

    var scxmlContent = $('#scxmlContent'),
        scxmlLoadInitControls = $('#scxmlLoadInitControls'),
        loadFromFile = $('#loadFromFile'),
        killAllStatecharts = $('#killAllStatecharts'),
        loadScxmlFromField = $('#loadScxmlFromField'),
        initScxmlButton = $('#initScxmlButton'),
        scxmlTrace = $('#scxmlTrace'),
        scxmlSimulationControls = $('#scxmlSimulationControls'),
        eventNameField = $('#eventNameField');

    var codeMirror = CodeMirror.fromTextArea(scxmlContent[0], window.location.search.match(/keyMap=vim/) ? {keyMap:'vim'} : undefined);

    codeMirror.setValue('<?xml version="1.0" encoding="UTF-8"?>\n'+
'    <scxml xmlns="http://www.w3.org/2005/07/scxml"\n'+
'           version="1.0" initial="off">\n'+
'        <state id="off">\n'+
'            <transition event="turnOn" target="on">\n'+
'                <script>parent.toggleBulb()</script>\n'+
'            </transition>\n'+
'        </state>\n'+
'        <state id="on">\n'+
'            <transition event="turnOff" target="off">\n'+
'                <script>parent.toggleBulb()</script>\n'+
'            </transition>\n'+
'        </state>\n'+
'    </scxml>');

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

    killAllStatecharts.click(function(){
        $('iframe').remove();
        all_off();
        turnOffBulb();
        $('#availableTransitions').html("");
    });

    loadFromFile.change(function(event) {
        var input = event.target;

        var reader = new FileReader();

        reader.onload = function(){
            codeMirror.setValue(reader.result);
        };

        reader.readAsText(input.files[0]);

    });

    initScxmlButton.click(function(){
        //read the content and load it up
        scion.scxml.documentStringToModel(null,codeMirror.getValue(),function(err,model){
            if(err) throw err;

            //clean up othe rinstance, if it exists
            //if(scxmlInstance){
            //    scxmlInstance.unregisterListener(listener);
            //} 

            model.prepare(function(err, fnModel) {
                        
                if(err) throw err;

                scxmlInstance = new scion.scxml.core.Statechart(fnModel);
                // scxmlInstance.registerListener(listener); 
     
                 var conf = scxmlInstance.start();
                 
                // trace('started new scxml instance >> ' + JSON.stringify(conf));
     
                 $('#availableTransitions').html("");
                 var availableTransitions=[];
                 $.each(scxmlInstance._model.descendants,function(i1, item){
                    $.each(item.transitions,function(i2, transition){
                        $.each(transition.events,function(i3, event) {
                            availableTransitions.push(event);
                        });
                    });
                 });

                 availableTransitionsHTML = "";

                 availableTransitions = [...new Set(availableTransitions)];

                 $.each(availableTransitions,function(i3,transition) {
                    availableTransitionsHTML+="<a href='#' onclick='trace(\"triggered event: ["+transition+"] resulting state: [\"+scxmlInstance.gen(\""+transition+"\")+\"]\")'>"+transition+"</a> ";
                 });
                 
                 $('#availableTransitions').html(availableTransitionsHTML);

            });
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
