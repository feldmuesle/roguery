/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// variables we need
var itemCount = 1;
var attrCount = 1;
var flagCount = 1;
var choiceCount = 1;

// display modal form for creating events

function resetEventForm(){
    //make sure the form is cleaned up
        $('#createEvent').trigger('reset');
        $('#createEvent input[name=form]').val('createEvent');
        $('#btnCreateEvent').text('create');
//        $('#createEvent input:radio').removeProp('checked');
        
        // hide all fold-outs
        $('#isChoiceFold').hide();
        $('#isFlaggedFold').hide();
        $('#reqFlagFold').hide();
        $('#itemFold').hide();
        $('#attrFold').hide();
        $('#diceFold').hide();  // show diceFold by default
//        $('#succTriggerFold').hide();
//        $('#failTriggerFold').hide();   
        $('#choicesFold').hide();
        $('#continueFold').hide();
        $('#continSelectFold').hide();
        
        foldOut('isChoice', 'isChoiceFold');
        foldOut('isFlagged', 'isFlaggedFold');
        foldOut('reqFlag', 'reqFlagFold');
        foldOut('useItem', 'itemFold');
        foldOut('attributes', 'attrFold');
        foldOut('branchtypes', 'diceFold');
        
        foldOutRadio('branchType');
        foldOutRadio('success');
        foldOutRadio('failure');
        foldOutRadio('choices');
        foldOutRadio('continue');
        
        populateSelect(locations,'location');
        populateSelect(locations,'succTrigger');
        populateSelect(locations,'failTrigger');
        
        //activate input-spinners for inputs of type number (-> function declared in helper.js)
        inputSpinner('choiceRandFold', 1, 8, 1);
        inputSpinner('diceFold', 5, 30, 5);
        inputSpinner('attrFold', 1, 150, 0);
};

$('#addEvent').click(function(){
        console.log('want to create an event?');
        resetEventForm();      
        $('#diceFold').show();  // show diceFold by default
        $('#succTriggerFold').show();
        $('#failTriggerFold').show(); 
        $('#continSelectFold').show();
        $('#choiceRandFold').show();
        $("#createEvents").modal('show'); 
    });
    
/******** animate events-form *********/
// fold out if checkbox gets checked
function foldOut(checkbox, foldId){
    $('#createEvent input[name='+checkbox+']').click(function(){
        console.log('hello from isChoice'); 
        var self = $(this);
        if(self.is(':checked')){
            console.log('you checked isChoice'); 
            $('#'+foldId).show();
        }else{                  
            $('#'+foldId).hide();
            console.log('you unchecked is Choice'); 
            
            // remove also eventual add-ons for items, attributes and flags
            if(checkbox == 'useItem'){ removeAddOns(itemCount,'removeItem');}
            if(checkbox == 'reqFlag'){ removeAddOns(flagCount,'removeFlag');}
            if(checkbox == 'attributes'){ removeAddOns(attrCount,'removeAttr');}
                
            
        }       
    });
}

function createInputWithSpinner(name){
    
    var btnUp = '<button class="btn btn-default"><i class="fa fa-caret-up"></i></button>';
    var btnDown = '<button class="btn btn-default"><i class="fa fa-caret-down"></i></button>';
    var btnGroup = '<div class="input-group-btn-vertical">'+btnUp+btnDown+'</div>';
    var input = '<input type="number" class="form-control" name="'+name+'" value="0">';
    var inputGroup = '<div class="input-group spinner">'+input+btnGroup+'</div>';
    
    return inputGroup;                
}

function foldOutRadio(radio){
    // catch the change-event 
    $('#createEvent input[name='+radio+']').on('change',function (){
        console.log('you checked a radio');
        if($('#createEvent input[name='+radio+']:checked')){

            var value = $('#createEvent input[name='+radio+']:checked').val();

            switch(value){
                case'dice':
                    $('#choicesFold').hide();
                    $('#continueFold').hide();
                    $('#diceFold').show();
                    break;

                case'end':
                    $('#diceFold').hide();
                    $('#choicesFold').hide();
                    $('#continueFold').hide();
                    break;

                case'choices':
                    $('#continueFold').hide();
                    $('#diceFold').hide();
                    $('#choicesFold').show();
                    break;

                case'continue':
                    $('#diceFold').hide();
                    $('#choicesFold').hide();
                    $('#continueFold').show();
                    break;

                case'failLoco':
                    // show select, populated with locations
                    populateSelect(locations, 'failTrigger');
                    $('#failTriggerFold').show();
                    break;

                case'failEventSgl':
                    // show select, populated with events
                    populateSelect(events, 'failTrigger');
                    $('#failTriggerFold').show();
                    break;

                case'failEventRand':
                    $('#failTriggerFold').hide();
                    break;

                case'succLoco':      
                    // show select, populated with locations
                    populateSelect(locations, 'succTrigger');
                    $('#succTriggerFold').show();
                    break;

                case'succEventSgl':
                    // show select, populated with events
                    populateSelect(events, 'succTrigger');
                    $('#succTriggerFold').show();
                    break; 

                case'succEventRand':
                    $('#succTriggerFold').hide();
                    break;

                case'continueLoco':
                    $('#continSelectFold').show();
                    populateSelect(locations, 'continueTo');
                    break;

                case'continueEvent':
                    $('#continSelectFold').show();
                    populateSelect(events, 'continueTo');
                    break;
                    
                case'continueRand':
                    $('#continSelectFold').hide();
                    break;

                case'choiceRand':
                    $('#pickChoiceFold').hide();
                    // remove also added choices if there are any
                    removeAddOns(choiceCount, 'removeChoice');
                    $('#choiceRandFold').show();
                    break;

                case'choiceCustom':
                    $('#pickChoiceFold').show();
                    $('#choiceRandFold').hide();
                    break;
            }

        }else {

        }
    });
}

// populate a select dynamically 
function populateSelect(array, name){
    var select = $('#createEvent select[name='+name+']');

    var options = '';
    for(var i=0; i<array.length; i++){
        options += '<option value="'+array[i].id+'">'+array[i].name+'</option>';
    }

    // first empty select, then populate it with the options
    $(select).html('');
    $(select).append(options);
}

// add new item to use
$('.add-attr').click(function(){
    var foldId = 'attrFold';
    // set counter for items
    attrCount += 1;
    var next = attrCount-1;
      
    var radio1 = '<label class="radio-inline">'+
            '<input type="radio" name="attrAction'+next+'" value="loose" checked> loose attribute'+
            '</label>';
    var radio2 = '<label class="radio-inline">'+
            '<input type="radio" name="attrAction'+next+'" value="gain" checked> gain attribute'+
            '</label>';   
    var formgroup = '<div class="form-group col-xs-11">'+radio1+radio2+'</div>';    
    var button = '<button id="removeAttr'+next+'"class="btn remove-attr" type="button">-</button>' ;       
    var buttonDiv = '<div class="col-xs-1">'+button+'</div>';                       
    var row = '<div class="row">'+formgroup+buttonDiv+'</div';
    var fold = '<div id="'+foldId+next+'" class="col-xs-11 col-xs-offset-1">'+row+'</div>';
    var spinner = createInputWithSpinner('attrNumb'+next);
    var amount = '<div class="form-group col-xs-4 pull-right">'+
                    '<label>Amount</label>'+spinner+'</div>';
    var options = '';
    for(var i=0; i<attributes.length; i++){
        options += '<option value="'+attributes[i]+'">'+attributes[i]+'</option>';
    }
    var select = '<select class="form-control" name="attr'+next+'">'+options+'</select>';
    var selectGroup = '<div class="form-group col-xs-8"><label>Choose another attribute</label>'+select+'</div>';
    var row2 = '<div id="attrRow'+next+'" class="row">'+selectGroup+'</div>';    
    
    $('#attribute').append(fold);
    $('#'+foldId+next).append(row2);
    $('#attrRow'+next).append(amount);
    
    //activate input-spinner for amount-field
    inputSpinner('attrFold'+next, 1, 150, 0);
    
    // remove fold
    $('#removeAttr'+next).click(function(){
                var element = '#'+foldId + next;
                $(element).remove();
                attrCount --;
                next--;
                
            });
    
    console.log('using items: '+attrCount);
});

// add new item to use
$('.add-item').click(function(){
    var foldId = 'itemFold';
    // set counter for items
    itemCount += 1;
    var next = itemCount- 1;
      
    var radio1 = '<label class="radio-inline">'+
            '<input type="radio" name="itemAction'+next+'" value="loose" checked> loose item'+
            '</label>';
    var radio2 = '<label class="radio-inline">'+
            '<input type="radio" name="itemAction'+next+'" value="gain" checked> gain item'+
            '</label>';
    var radio3 = '<label class="radio-inline">'+
            '<input type="radio" name="itemAction'+next+'" value="require" checked> require item'+
            '</label>';    
    var formgroup = '<div class="form-group col-xs-11">'+radio1+radio2+radio3+'</div>';    
    var button = '<button id="removeItem'+next+'" class="btn remove-item" type="button">-</button>' ;       
    var buttonDiv = '<div class="col-xs-1">'+button+'</div>';                       
    var row = '<div class="row">'+formgroup+buttonDiv+'</div';
    
    var select = '<select class="form-control" name="item'+next+'"></select>';
    var selectGroup = '<div class="form-group"><label>Choose another item</label>'+select+'</div>';
    var fold = '<div id="'+foldId+next+'" class="col-xs-11 col-xs-offset-1">'+row+'</div>';
    
    $('#item').append(fold);
    $('#'+foldId+next).append(selectGroup);
    populateSelect(items, 'item'+next);   
    
    // remove folds
    $('#removeItem'+next).click(function(){
                var element = '#'+foldId + next;
                $(element).remove();
                itemCount--;
                next--;
                console.log(itemCount+' after removal');
            });
    
    console.log('using items: '+itemCount);
});

// add new flag to event-form
$('.add-flag').click(function(){
    var foldId = 'reqFlagFold';
    // set counter for items
    flagCount += 1;
    var next = flagCount- 1;      
    var button = '<button id="removeFlag'+next+'" class="btn remove-flag" type="button">-</button>' ;       
    var buttonDiv = '<div class="col-xs-1">'+button+'</div>';                       
    var select = '<select class="form-control" name="flag'+next+'"></select>';
    var selectGroup = '<div class="col-xs-10"><label>Choose another flag</label>'+select+'</div>';
    var row = '<div id="flagRow'+next+'" class="row form-group">'+selectGroup+'</div';
    var fold = '<div id="'+foldId+next+'" class="col-xs-11 col-xs-offset-1">'+row+'</div>';
    
    $('#flag').append(fold);
    $('#flagRow'+next).append(buttonDiv);
    populateSelect(flags, 'flag'+next);   
    
    // remove folds
    $('#removeFlag'+next).click(function(){
                var element = '#'+foldId + next;
                $(element).remove();
                flagCount--;
                next--;
                console.log(flagCount+' after removal');
            });
    
    console.log('using items: '+flagCount);
});

// add new choice to event in form
$('.add-choice').click(function(){
    var foldId = 'pickChoiceFold';
    // set counter for items
    choiceCount += 1;
    var next = choiceCount- 1; 
    
    var button = '<button id="removeChoice'+next+'" class="btn remove-choice" type="button">-</button>' ;       
    var buttonDiv = '<div class="col-xs-1">'+button+'</div>';    
    var select = '<select class="form-control" name="choice'+next+'"></select>';
    var selectGroup = '<div class="col-xs-10"><label>Pick another choice</label>'+select+'</div>';
    var fold = '<div id="'+foldId+next+'" class="row form-group">'+selectGroup+'</div>';
    
    $('#choice').append(fold);
    $('#'+foldId+next).append(buttonDiv);
    populateSelect(events, 'choice'+next);   
    
    // remove folds
    $('#removeChoice'+next).click(function(){
                var element = '#'+foldId + next;
                $(element).remove();
                choiceCount--;
                next--;
                console.log(choiceCount+' after removal');
            });
    
    console.log('using items: '+choiceCount);
});

// remove-all add-ons = all fields that were added dynamically
function removeAddOns(count, buttonId){
    
    for(var i=count; i>0; i--){
        $('#'+buttonId+i).click();
    }
    
}

/*** CREATE new event **********/

    $('#btnCreateEvent').click(function(){
    
        //empty validation-alert
        $('#alertEvent').text(''); 
       
       // set value of all unchecked checkboxes to false
       $('#createEvent').find('input:checkbox:not(:checked)').each(function(){
           console.log('there are unchecked boxes');
          $(this).val('false'); 
       });
       
       // get all values from form 
       var form = $('#createEvent input[name=form]').val();
       console.log(form);
       var location = $('#createEvent select[name=location] option:selected').val();
       var name = $('#createEvent input[name=name]').val();
       var text = $('#createEvent textarea[name=text]').val();
       var newPara = $('#createEvent input[name=newPara]').val();
       var isChoice = $('#createEvent input[name=isChoice]').val();
       var choiceText = $('#createEvent input[name=choiceText]').val();
       var isFlagged = $('#createEvent input[name=isFlagged]').val();
       var flagDesc = $('#createEvent input[name=flagDesc]').val();
       var reqFlag = $('#createEvent input[name=reqFlag]').val();
       
       var useItem = $('#createEvent input[name=useItem]').val();       
       var attributes = $('#createEvent input[name=attributes]').val();
       
       var branchType = $('#createEvent input[name=branchType]:checked').val();
       var diceAttr = $('#createEvent select[name=diceAttr] option:selected').val();
       var difficulty = $('#createEvent input[name=difficulty]').val();
       var succTrigger = $('#createEvent select[name=succTrigger] option:selected').val();
       var success = $('#createEvent input[name=success]:checked').val();
       var failTrigger = $('#createEvent select[name=failTrigger] option:selected').val();
       var failure = $('#createEvent input[name=failure]:checked').val(); 
       var contin = $('#createEvent input[name=continue]:checked').val(); 
       var continueTo = $('#createEvent select[name=continueTo] option:selected').val(); 
       var choices = $('#createEvent input[name=branchtype]:checked').val();       
       var choiceNumb = $('#createEvent input[name=choiceNumb]').val();
       
       console.log('continueTo= '+continueTo);
       
       var event = {
            'form'      :   form,
            'location'  :   location,
            'name'      :   name,
            'text'      :   text,
            'newPara'   :   newPara,
            'isChoice'  :   isChoice,
            'setFlag'   :   isFlagged,
            'reqFlag'   :   reqFlag,
            'items'      :   useItem,
            'attributes':   attributes,
            'branchType':   branchType,
            'branch'    :   {}             
        };        
        
        // if it's a choice, set the choice-text
        if(isChoice == 'true'){
            console.log('this event is a choice!');
            event.isChoice = choiceText;
        }
        
        // if a flag is set, get the desc.
        if(isFlagged == 'true'){
            event.setFlag = flagDesc;
        }             
              
       // if there are any items, push them in items-array
       if(useItem == 'true'){
            var items = [];            
            for(var i=0; i<itemCount; i++){                
                var itemAction = $('#createEvent input[name=itemAction'+i+']:checked').val();
                var itemPick = $('#createEvent select[name=item'+i+'] option:selected').val();
                
                var item = {
                     item     :   itemPick,
                     action   :   itemAction
                 };
                 items.push(item);
            }
            event.items = items;
       }
       
       // if there are any flags reqiured, push them in flags-array
       if(reqFlag == 'true'){
            var flags = [];
            
            for(var i=0; i<flagCount; i++){
                var flag = $('#createEvent select[name=flag'+i+'] option:selected').val();
                flags.push(flag);
            }
            event.reqFlag = flags;
          
        }
        
        // if there are any flags reqiured, push them in flags-array
       if(attributes == 'true'){
            var attributes = [];
            
            for(var i=0; i<attrCount; i++){
                var attrAction = $('#createEvent input[name=attrAction'+i+']:checked').val();
                var attr = $('#createEvent select[name=attr'+i+'] option:selected').val();
                var attrNumb = $('#createEvent input[name=attrNumb'+i+']').val();
                
                var attribute = {                                                                                                                                                       
                    attribute  :   attr,
                    action  :    attrAction,
                    amount  :   attrNumb  
                };
                
                attributes.push(attribute);
            }
            event.attributes = attributes;
          
        }
        
        // dependent on branch-type, create branch, 
        
        switch(branchType){
            case 'dice':
                var dices = {
                    'attribute'     :   diceAttr,
                    'difficulty'    :   difficulty,
                    'success'       :   {
                            'type'      :   success,
                            'trigger'   :   succTrigger
                    },
                    'failure'       :   {
                            'type'      :   failure,
                            'trigger'   :   failTrigger
                            }
                };
                event.branch = dices;
                break;
            
            case 'continue':
                var continueObj ={'type' : contin};
                if(contin != 'continueRand'){
                    continueObj.continueTo = continueTo;
                }
                event.branch = continueObj;
                break;
                
            case 'choices':
                
                var choiceBranch = {
                    'type'    :   choices
                };                                                
               // set choice-array 
                if(choiceCount > 0){
                    var choiceArr = [];            
                    for(var i=0; i < choiceCount; i++){                
                        var choice = $('#createEvent select[name=choice'+i+'] option:selected').val();
                        choiceArr.push(choice);
                    }
                    choiceBranch.events = choiceArr;
                }                
                event.branch = choiceBranch; 
                break;
        }
        
       console.log(event);
       
       if(form == 'updateEvent'){
           console.log('event to update: id '+$('#eventId').val());
           event.id = $('#eventId').val();
       }
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',event, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertEvent').show();
                $('#alertEvent').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                    $('#alertEvent').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#createEvents').modal('hide');
                // reset modal-button again
                $('#createEvent input[name=form]').val('createEvent');
                $('#btnCreateEvent').text('create');
                
                // show success-message
                alertSuccess('#eventSuccess',data['msg']);
                events = data['events'];
                updateEventList();
                // clear all inputs in form
                $('#createEvent').trigger('reset');
                console.dir(events);
            }
       });
       
    });
    
/*********** UPDATE EVENT ********************/
    
//button for showing modal form for updation item
    $(document).on('click','.updateEvent', function(){
        console.log('want to update event?');
        // make sure form is clean
        $('#alertEvent').hide();
        $('#createEvent').trigger('reset');
        $('#createEvent input:checkbox').removeAttr('checked');
        resetEventForm();  
        
        // get id from button-element and item-object from items-array
        var eventId = this.id.substr(8,this.id.length); // btnEvent = 8 chars
        var event = getRecordById(events, eventId);
        console.log('eventId to update: '+eventId);
 
        // populate item in modal form
        $('#createEvent input[name=form]').val('updateEvent');
        $('#createEvent input[name=name]').val(event.name);
        $('#createEvent select[name=location] option:selected').val(event.location.id);
        $('#createEvent textarea[name=text]').text(event.text);
        
        if(event.newPara != false){
            $('#createEvent input[name=newPara]:checkbox').attr('checked',true);
        }
        
        if(event.isChoice != false){
            console.log('there is a choice');
            $('#createEvent input[name=isChoice]:checkbox').attr('checked',true);
            $('#createEvent input[name=choiceText]').val(event.choiceText);
            $('#isChoiceFold').show();
        }

        if(event.setFlag != false){
            console.log('there is a flag set');
            $('#createEvent input[name=isFlagged]:checkbox').attr('checked',true);
            $('#createEvent input[name=flagDesc]').val(event.flag.name);
            $('#isFlaggedFold').show();
        }
        
        if(event.reqFlag.length > 0){
            $('#createEvent input[name=reqFlag]:checkbox').attr('checked',true);
            for(var i=0; i < event.reqFlag.length; i++){
                if(i != 0){
                    $('.add-flag').click();
                    $('#createEvent select[name=flag'+i+']').val(event.reqFlag[i].id).attr('selected','selected');                    
                }else{
                    $('#reqFlagFold').show();
                    $('#createEvent select[name=flag0]').val(event.reqFlag[0].id).attr('selected','selected');
                }
            }
        }
        
        if(event.items.length > 0){
            $('#createEvent input[name=useItem]:checkbox').attr('checked',true);
            for(var i=0; i < event.items.length; i++){
                if(i != 0){
                    $('.add-item').click();
                    $('#createEvent input[name=itemAction'+i+']:radio[value='+event.items[i].action+']').attr('checked',true);
                    $('#createEvent select[name=item'+i+']').val(event.items[i].item).attr('selected','selected');                    
                }else{
                    $('#itemFold').show();
                    $('#createEvent input[name=itemAction0]:radio[value='+event.items[i].action+']').attr('checked',true);
                    $('#createEvent select[name=item0]').val(event.items[0].item).attr('selected','selected');
                }
            }
        }
        
        if(event.attributes.length > 0){
            console.log('attributes.length = '+event.attributes.lenght);
            $('#createEvent input[name=attributes]:checkbox').attr('checked',true);
            for(var i=0; i < event.attributes.length; i++){
                if(i != 0){
                    $('.add-attr').click();
                    $('#createEvent input[name=attrAction]:radio[value='+event.attributes[i].action+']').attr('checked',true);
                    $('#createEvent select[name=attr'+i+']').val(event.attributes[i].attribute).attr('selected','selected');                    
                    $('#createEvent input[name=attrNumb'+i+']').val(event.attributes[i].amount);
                }else{
                    $('#attrFold').show();
                    $('#createEvent input[name=attrAction0]:radio[value='+event.attributes[0].action+']').attr('checked',true);
                    $('#createEvent select[name=attr0]').val(event.attributes[0].attribute).attr('selected','selected');
                    $('#createEvent input[name=attrNumb0]').val(event.attributes[0].amount);
                }
            }
        }
        
        //get the right branch-type and display branch
        switch(event.branchType){
            case'dice':
                $('#createEvent input[name=dice]:radio[value='+event.branchType+']').attr('checked',true);
                $('#createEvent select[name=diceAttr]').val(event.dice.attribute).attr('selected', 'selected');
                $('#createEvent input[name=difficulty]').val(event.dice.difficulty);
                $('#createEvent input[name=success]:radio[value='+event.dice.success.type+']').attr('checked',true);
                $('#createEvent input[name=failure]:radio[value='+event.dice.failure.type+']').attr('checked',true);
                
                console.log(event);
                
                if(event.dice.success.type == 'succLoco'){
                    populateSelect(locations, 'succTrigger');
                    $('#createEvent select[name=succTrigger]').val(event.dice.success.location.id).attr('selected', 'selected');
                }else{
                    populateSelect(events, 'succTrigger');
                    $('#createEvent select[name=succTrigger]').val(event.dice.success.event.id).attr('selected', 'selected');
                }
                if(event.dice.failure.type == 'failLoco'){
                    populateSelect(locations, 'failTrigger');
                    $('#createEvent select[name=failTrigger]').val(event.dice.failure.location.id).attr('selected', 'selected');
                }else{
                    populateSelect(events, 'failTrigger');
                    $('#createEvent select[name=failTrigger]').val(event.dice.failure.event.id).attr('selected', 'selected');
                }
                $('#diceFold').show();
                break;
                
            case'choices':
                $('#choicesFold').show();
                $('#createEvent input[name=branchType]:radio[value='+event.branchType+']').attr('checked',true);
                if(event.choices.length > 0){
//                    $('#createEvent input[name=choices]:checkbox').attr('checked',true);
                    for(var i=0; i < event.choices.length; i++){
                        if(i != 0){
                            $('.add-choice').click();
                            $('#createEvent select[name=choice'+i+']').val(event.choices[i].id).attr('selected','selected');                    
                            
                        }else{
                            $('#pickChoiceFold').show();
                            $('#createEvent select[name=choice0]').val(event.choices[0].id).attr('selected','selected');
                            
                        }
                    }
                }
                break;
                
            case'continue':
                // set the radios
                $('#createEvent input[name=branchType]:radio[value='+event.branchType+']').attr('checked',true);
                $('#createEvent input[name=continue]:radio[value='+event.continueTo.type+']').attr('checked',true);
                                  
                if(event.continueTo.type == 'continueLoco'){
                    $('#createEvent select[name=continueTo]').val(event.continueTo.location.id).attr('selected','selected');
                    $('#continSelectFold').show();
                            
                }else if(event.continueTo.type == 'continueEvent'){
                    
                    populateSelect(events,'continueTo');
                    $('#createEvent select[name=continueTo]').val(event.continueTo.event.id).attr('selected','selected');
                    $('#continSelectFold').show();
                }
                $('#continueFold').show();                
                break;
                
            case'end':
                $('#createEvent input[name=branchType]:radio[value='+event.branchType+']').attr('checked',true);
                break;
                
        }
       
        $('#eventId').val(event.id);

        console.log(event);
        $('#btnCreateEvent').text('Update');
        $("#createEvents").modal('show');
    });    
    

    function updateEventList(){
        console.log('hello from update crud list');
        var html='';
        for(var i=0; i<events.length; i++){
            html =  html+'<li class="list-group-item">'+
                        '<a id="event'+events[i].id+'" class="showEvent" href="#">'+events[i].name+'</a>'+
                        '<button class="deleteEvent pull-right btn btn-xs margin" id="eventBtnDel'+events[i].id+'">Delete</button>'+
                        '<button class="updateEvent pull-right btn btn-xs" id="eventBtn'+events[i].id+'">Update</button>'+                       
                    '</li>';            
        }
        
        $('#eventList').html(html);
    }
    
    /************ misc-functions *******************/
    
    // misc-functions for helping
    function getRecordById(recordArray, recordId){
        for(var i=0; i<recordArray.length; i++){
                if(recordArray[i].id == recordId){
                    var room = recordArray[i];
                    return room;
                }
            }
    }
    
    
    // show success-alert depending on alertId
    function alertSuccess(alertId, msgString){
        // make sure it's clean and empty
        $(alertId).text('');
        
        var msg = '<p>'+msgString+'</p>';
        $(alertId).append(msg);
        $(alertId).slideDown('slow').fadeIn(3000, function(){
            setTimeout(function(){
                $(alertId).fadeOut({duration:1000, queue:false}).slideUp('slow');
            },2000);
            
        });
    }