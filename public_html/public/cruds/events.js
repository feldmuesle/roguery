/* 
 * display modal form for creating events
 */


// variables we need
var itemCount = 1;
var attrCount = 1;
var flagCount = 1;
var rejectFlagCount = 1;
var choiceCount = 1;
var randCount = 1;

//add interactivitiy
foldOut('isChoice', 'isChoiceFold');
foldOut('isFlagged', 'isFlaggedFold');
foldOut('reqFlag', 'reqFlagFold');
foldOut('rejectFlag', 'rejectFlagFold');
foldOut('useItem', 'itemFold');
foldOut('attributes', 'attrFold');
foldOut('branchtypes', 'diceFold');

foldOutRadio('branchType');
foldOutRadio('success');    
foldOutRadio('failure');
foldOutRadio('choices');
foldOutRadio('continue');
    
//activate input-spinners for inputs of type number (-> function declared in helper.js)
inputSpinner('choiceRandFold', 1, 8, 1);
inputSpinner('diceFold', 5, 30, 5);
inputSpinner('attrFold', 1, 150, 0);

function resetEventForm(){
    //make sure the form is cleaned up
    $('#alertEvent').hide();
    $('#createEvent').trigger('reset');
    $('#createEvent textarea[name=text]').html('');
    $('#createEvent input[name=form]').val('createEvent');
    $('#btnCreateEvent').text('create');
    $('#createEvent input[type=checkbox]:checked').removeAttr('checked');

    // hide all fold-outs
    $('#isChoiceFold').hide();
    $('#isFlaggedFold').hide();
    $('#reqFlagFold').hide();
    $('#rejectFlagFold').hide();
    $('#itemFold').hide();
    $('#attrFold').hide();
    $('#diceFold').hide();  // show diceFold by default
//        $('#succTriggerFold').hide();
//        $('#failTriggerFold').hide();   
    $('#choicesFold').hide();
    $('#continueFold').hide();
    $('#continSelectFold').hide();
    $('#continRandFold').hide();

    // set all checkbox-values to true
    $('#createEvent').find('input:checkbox').each(function(){       
        $(this).val('true'); 
        $(this).attr('checked', false);
    });

    // remove add-ons if there are
    removeAddOns(itemCount,'removeItem');
    removeAddOns(flagCount,'removeFlag');
    removeAddOns(rejectFlagCount,'removeRejectFlag');
    removeAddOns(attrCount,'removeAttr'); 
    removeAddOns(choiceCount,'removeChoice');
    removeAddOns(randCount,'removeRandom');

    populateSelect(locations,'createEvent', 'location');
    populateSelect(locations, 'createEvent','succTrigger');
    populateSelect(locations, 'createEvent','failTrigger');
    populateSelect(items, 'createEvent','item0');
};

$('#addEvent').click(function(){

    resetEventForm();      
    // select current eventLococation automatically
    $('#createEvent select[name=location] option[value='+eLoco+']').attr('selected', 'selected');
    // make sure branch-type-radios are set to dice
    $('#createEvent input[name=branchType]:radio[value=dice]').prop('checked','checked');
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
        var self = $(this);
        if(self.is(':checked')){ 
            $('#'+foldId).show();            
        }else{                  
            $('#'+foldId).hide();
            
            // remove also eventual add-ons for items, attributes and flags
            if(checkbox == 'useItem'){ removeAddOns(itemCount,'removeItem');}
            if(checkbox == 'reqFlag'){ removeAddOns(flagCount,'removeFlag');}
            if(checkbox == 'rejectFlag'){ removeAddOns(rejectFlagCount,'removeRejectFlag');}
            if(checkbox == 'attributes'){ removeAddOns(attrCount,'removeAttr');}            
        }     
        $(self).trigger('change');
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
   
        if($('#createEvent input[name='+radio+']:checked')){

            var value = $('#createEvent input[name='+radio+']:checked').val();

            switch(value){
                case'dice':
                    $('#choicesFold').hide();
                    $('#continueFold').hide();
                    $('#diceFold').show();
                    removeAddOns(randCount,'removeRandom');
                    break;

                case'end':
                    $('#diceFold').hide();
                    $('#choicesFold').hide();
                    $('#continueFold').hide();
                    removeAddOns(randCount,'removeRandom');
                    break;

                case'choices':
                    $('#continueFold').hide();
                    $('#diceFold').hide();
                    $('#choicesFold').show();
                    removeAddOns(randCount,'removeRandom');
                    //populate choiceFold with only 
                    var locoEvents = getEventsByLoco(events, eLoco);
                    var choices = getChoicesOnly(locoEvents);
                    populateSelect(choices, 'createEvent', 'choice0');
                    break;

                case'continue':
                    $('#diceFold').hide();
                    $('#choicesFold').hide();
                    $('#continueFold').show();
                    removeAddOns(randCount,'removeRandom');
                    break;

                case'failLoco':
                    // show select, populated with locations
                    populateSelect(locations, 'createEvent', 'failTrigger');
                    $('#failTriggerFold').show();
                    break;

                case'failEventSgl':
                    // show select, populated with events
                    var locoEvents = getEventsByLoco(events, eLoco);
                    populateSelect(locoEvents, 'createEvent', 'failTrigger');
                    $('#failTriggerFold').show();
                    break;

                case'failEventRand':
                    $('#failTriggerFold').hide();
                    break;

                case'succLoco':      
                    // show select, populated with locations
                    populateSelect(locations, 'createEvent', 'succTrigger');
                    $('#succTriggerFold').show();
                    break;

                case'succEventSgl':
                    // show select, populated with events
                    var locoEvents = getEventsByLoco(events, eLoco);
                    populateSelect(locoEvents, 'createEvent', 'succTrigger');
                    $('#succTriggerFold').show();
                    break; 

                case'succEventRand':
                    $('#succTriggerFold').hide();
                    break;

                case'continueLoco':
                    $('#continSelectFold').show();
                    $('#continRandFold').hide();
                    populateSelect(locations, 'createEvent', 'continueTo');
                    removeAddOns(randCount,'removeRandom');
                    break;

                case'continueEvent':
                    $('#continSelectFold').show();
                    $('#continRandFold').hide();
                    var locoEvents = getEventsByLoco(events, eLoco);
                    populateSelect(locoEvents, 'createEvent', 'continueTo');
                    removeAddOns(randCount,'removeRandom');
                    break;
                    
                case'continueRand':
                    $('#continSelectFold').hide();
                    $('#continRandFold').show();
                    var locoEvents = getEventsByLoco(events, eLoco);
                    populateSelect(locoEvents, 'createEvent', 'random0');
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

        }
    });
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
    populateSelect(items, 'createEvent', 'item'+next);   
    
    // remove folds
    $('#removeItem'+next).click(function(){
        var element = '#'+foldId + next;
        $(element).remove();
        itemCount--;
        next--;
    });
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
    populateSelect(flags, 'createEvent' ,'flag'+next);   
    
    // remove folds
    $('#removeFlag'+next).click(function(){
        var element = '#'+foldId + next;
        $(element).remove();
        flagCount--;
        next--;
    });    
});

// add new rejectflag to event-form
$('.add-rejectFlag').click(function(){
    var foldId = 'rejectFlagFold';
    // set counter for items
    rejectFlagCount += 1;
    var next = rejectFlagCount- 1;      
    var button = '<button id="removeRejectFlag'+next+'" class="btn remove-flag" type="button">-</button>' ;       
    var buttonDiv = '<div class="col-xs-1">'+button+'</div>';                       
    var select = '<select class="form-control" name="rejectFlag'+next+'"></select>';
    var selectGroup = '<div class="col-xs-10"><label>Choose another flag</label>'+select+'</div>';
    var row = '<div id="rejectFlagRow'+next+'" class="row form-group">'+selectGroup+'</div';
    var fold = '<div id="'+foldId+next+'" class="col-xs-11 col-xs-offset-1">'+row+'</div>';
    
    $('#rejectFlag').append(fold);
    $('#rejectFlagRow'+next).append(buttonDiv);
    populateSelect(flags, 'createEvent' ,'rejectFlag'+next);   
    
    // remove folds
    $('#removeRejectFlag'+next).click(function(){
        var element = '#'+foldId + next;
        $(element).remove();
        rejectFlagCount--;
        next--;
    });
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
    // populate select only with events that are choices and of this location  
    var locoEvents = getEventsByLoco(events, eLoco);
    var choices = getChoicesOnly(locoEvents);
    populateSelect(choices, 'createEvent', 'choice'+next);  
    
    // remove folds
    $('#removeChoice'+next).click(function(){
        var element = '#'+foldId + next;
        $(element).remove();
        choiceCount--;
        next--;
    });
});

$('.add-random').click(function(){
    var foldId = 'continRandFold';
    // set counter for items
    randCount += 1;
    var next = randCount- 1; 
    
    var button = '<button id="removeRandom'+next+'" class="btn remove-random" type="button">-</button>' ;       
    var buttonDiv = '<div class="col-xs-1">'+button+'</div>';    
    var select = '<select class="form-control" name="random'+next+'"></select>';
    var selectGroup = '<div class="col-xs-10"><label>Pick another random event</label>'+select+'</div>';
    var fold = '<div id="'+foldId+next+'" class="row form-group">'+selectGroup+'</div>';
    
    $('#continues').append(fold);
    $('#'+foldId+next).append(buttonDiv);
    // populate select only with events that are choices and of this location  
    var locoEvents = getEventsByLoco(events, eLoco);
    populateSelect(locoEvents, 'createEvent', 'random'+next);  
    
    // remove folds
    $('#removeRandom'+next).click(function(){
        var element = '#'+foldId + next;
        $(element).remove();
        randCount--;
        next--;
    });
});

// remove-all add-ons = all fields that were added dynamically
function removeAddOns(count, buttonId){    
    for(var i=count; i>0; i--){
        $('#'+buttonId+i).click();
    }    
}

/************ CREATE new event **********/


    $('#btnCreateEvent').click(function(){
    
        //empty validation-alert
        $('#alertEvent').text(''); 
       
       // set value of all unchecked checkboxes to false
       $('#createEvent').find('input:checkbox:not(:checked)').each(function(){
          $(this).val('false'); 
       });
       
       // get all values from form 
       var form = $('#createEvent input[name=form]').val();
       var location = $('#createEvent select[name=location] option:selected').val();
       var name = $('#createEvent input[name=name]').val();
       var text = $('#createEvent textarea[name=text]').val();
       var newPara = $('#createEvent input[name=newPara]').val();
       var isChoice = $('#createEvent input[name=isChoice]').val();
       var choiceText = $('#createEvent input[name=choiceText]').val();
       var isFlagged = $('#createEvent input[name=isFlagged]').val();
       var flagDesc = $('#createEvent input[name=flagDesc]').val();
       var reqFlag = $('#createEvent input[name=reqFlag]').val();
       var rejectFlag = $('#createEvent input[name=rejectFlag]').val();       
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
       
       // set current eventLocation 
       eLoco = location;
       
       var event = {
            'form'      :   form,
            'location'  :   location,
            'name'      :   name,
            'text'      :   text,
            'newPara'   :   newPara,
            'isChoice'  :   isChoice,
            'setFlag'   :   isFlagged,
            'reqFlag'   :   reqFlag,
            'rejectFlag':   rejectFlag,
            'items'     :   useItem,
            'attributes':   attributes,
            'branchType':   branchType,
            'branch'    :   {}             
        };        
                
        // if it's a choice, set the choice-text
        if(isChoice == 'true'){
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
       if(rejectFlag == 'true'){
            var flags = [];
            
            for(var i=0; i<rejectFlagCount; i++){
                var flag = $('#createEvent select[name=rejectFlag'+i+'] option:selected').val();
                flags.push(flag);
            }
            event.rejectFlag = flags;          
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
        
        // dependent on branch-type, create branch        
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
                }else{
                    //get all random events and add array
                    // set choice-array 
                    if(randCount > 0){
                        var randomArr = [];            
                        for(var i=0; i < randCount; i++){                
                            var random = $('#createEvent select[name=random'+i+'] option:selected').val();
                            randomArr.push(random);
                        }
                        continueObj.continueTo = randomArr;
                    }  
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
       
       if(form == 'updateEvent'){
           event.id = $('#eventId').val();
       }
              
       $.post('/crud',event, function(data){
         
           if(!data['success']){
                var errors = data['errors'];
                $('#alertEvent').show();
                $('#alertEvent').append('<h3>'+data['msg']+'</h3>');
                
                for(var key in errors){
                    var err = errors[key];
                    $('#alertEvent').append('<p>'+err.message+'</p>');
                }
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
            }
        });       
    });
    
/*********** UPDATE EVENT ********************/
    
//button for showing modal form for updation item
    $(document).on('click','.updateEvent', function(){
       
        // make sure form is clean
        $('#alertEvent').hide();
        $('#createEvent').trigger('reset');
        resetEventForm();  
//        $('#createEvent input:checkbox').removeAttr('checked'); 
        $('#createEvent input:checkbox').val('true');
        
                
        // get id from button-element and item-object from items-array
        var eventId = this.id.substr(5,this.id.length); // event = 5 chars
        var event = getRecordById(events, eventId);
        eLoco = event.location.id;
        
        // populate item in modal form
        $('#createEvent input[name=form]').val('updateEvent');
        $('#createEvent input[name=name]').val(event.name);        
        $('#createEvent select[name=location] option[value='+event.location.id+']').attr('selected', 'selected');
        $('#createEvent textarea[name=text]').text(event.text);
        
        if(event.newPara != false){
            $('#createEvent input[name=newPara]:checkbox').attr('checked',true);
        }
        
        if(event.isChoice != false){
            $('#createEvent input[name=isChoice]:checkbox').attr('checked',true);
            $('#createEvent input[name=choiceText]').val(event.choiceText);
            $('#isChoiceFold').show();
        }

        if(event.setFlag != false){
            $('#createEvent input[name=isFlagged]:checkbox').attr('checked',false).trigger('change');
            $('#createEvent input[name=isFlagged]:checkbox').prop('checked',true).trigger('change');
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
        
        if(event.rejectFlag.length > 0){
            $('#createEvent input[name=rejectFlag]:checkbox').attr('checked',true);
            for(var i=0; i < event.rejectFlag.length; i++){
                if(i != 0){
                    $('.add-rejectFlag').click();
                    $('#createEvent select[name=rejectFlag'+i+']').val(event.rejectFlag[i].id).attr('selected','selected');                    
                }else{
                    $('#rejectFlagFold').show();
                    $('#createEvent select[name=rejectFlag0]').val(event.rejectFlag[0].id).attr('selected','selected');
                }
            }
        }
        
        if(event.items.length > 0){
            $('#createEvent input[name=useItem]:checkbox').attr('checked',true);
            for(var i=0; i < event.items.length; i++){
                if(i != 0){
                    $('.add-item').click();
                    $('#itemFold'+i+' input[name=itemAction'+i+']:checked').removeAttr('checked');
                    $('#createEvent input[name=itemAction'+i+']:radio[value='+event.items[i].action+']')
                            .prop('checked','checked').trigger('change');
                    $('#createEvent select[name=item'+i+']').val(event.items[i].item[0].id).attr('selected','selected');                    
                }else{
                    $('#itemFold').show();
                    $('#createEvent input[name=itemAction'+i+']:radio[value='+event.items[i].action+']')
                            .prop('checked','checked').trigger('change');
                    $('#createEvent select[name=item0]').val(event.items[0].item[0].id).attr('selected','selected');
                }
            }
        }
        
        if(event.attributes.length > 0){
           
            $('#createEvent input[name=attributes]:checkbox').attr('checked',true);
            for(var i=0; i < event.attributes.length; i++){
                if(i != 0){
                    $('.add-attr').click();
                    $('#attrFold'+i+' input[name=attrAction'+i+']:checked').removeAttr('checked');
                    $('#attrFold'+i+' input[name=attrAction'+i+']:radio[value='+event.attributes[i].action+']')
                            .prop('checked','checked').trigger('change');
                    $('#createEvent select[name=attr'+i+']').val(event.attributes[i].attribute).attr('selected','selected');                    
                    $('#createEvent input[name=attrNumb'+i+']').val(event.attributes[i].amount);
                }else{
                    
                    $('#attrFold input[name=attrAction0]:checked').removeAttr('checked');
                    $('#attrFold input[name=attrAction0]:radio[value='+event.attributes[0].action+']')
                            .prop('checked','checked').trigger('change');
                    $('#createEvent select[name=attr0]').val(event.attributes[0].attribute).attr('selected','selected');
                    $('#createEvent input[name=attrNumb0]').val(event.attributes[0].amount);
                    $('#attrFold').show();
                }
            }
        }
        
        //get the right branch-type and display branch  
        var currBranch = $('#createEvent input[name=branchType]:checked').val();
        if(currBranch != event.branchType){
            $('#createEvent input[name=branchType]:checked').attr('checked',false).trigger('change');
            $('#createEvent input[name=branchType]:radio[value='+event.branchType+']')
                    .attr('checked',true).trigger("change");
        }
        
        var locoEvents = getEventsByLoco(events, eLoco);
        
        switch(event.branchType){
            case'dice':
                $('#createEvent select[name=diceAttr]').val(event.dice.attribute).attr('selected', 'selected');
                $('#createEvent input[name=difficulty]').val(event.dice.difficulty);
                $('#createEvent input[name=success]:radio[value='+event.dice.success.type+']').attr('checked',true);
                $('#createEvent input[name=failure]:radio[value='+event.dice.failure.type+']').attr('checked',true);                              
                
                if(event.dice.success.type == 'succLoco'){
                    populateSelect(locations, 'createEvent', 'succTrigger');
                    $('#createEvent select[name=succTrigger]').val(event.dice.success.location.id).attr('selected', 'selected');
                }else{
                    populateSelect(locoEvents, 'createEvent', 'succTrigger');
                    $('#createEvent select[name=succTrigger]').val(event.dice.success.event.id).attr('selected', 'selected');
                }
                if(event.dice.failure.type == 'failLoco'){
                    populateSelect(locations, 'createEvent', 'failTrigger');
                    $('#createEvent select[name=failTrigger]').val(event.dice.failure.location.id).attr('selected', 'selected');
                }else{
                    populateSelect(locoEvents, 'createEvent', 'failTrigger');
                    $('#createEvent select[name=failTrigger]').val(event.dice.failure.event.id).attr('selected', 'selected');
                }
                $('#diceFold').show();
                break;
                
            case'choices':
                $('#choicesFold').show();
                
                if(event.choices.length > 0){
                    
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
                $('#createEvent input[name=continue]:radio[value='+event.continueTo.type+']')
                        .prop('checked',true).trigger('change');
                                  
                if(event.continueTo.type == 'continueLoco'){
                    populateSelect(locations,'createEvent','continueTo');
                    $('#createEvent select[name=continueTo]').val(event.continueTo.location.id).attr('selected','selected');
                    $('#continSelectFold').show();
                            
                }else if(event.continueTo.type == 'continueEvent'){
                    
                    populateSelect(locoEvents,'createEvent','continueTo');
                    $('#createEvent select[name=continueTo]').val(event.continueTo.event.id).attr('selected','selected');
                    $('#continSelectFold').show();
                }else {
                    
                    if(event.continueTo.random.length > 0){
                       
                        for(var i=0; i < event.continueTo.random.length; i++){
                            if(i !== 0){
                                populateSelect(locoEvents,'createEvent','random'+i);
                                $('.add-random').click();
                                $('#createEvent select[name=random'+i+']').val(event.continueTo.random[i].id).attr('selected','selected');                    

                            }else{                                
                                $('#continRandFold').show();
                                populateSelect(locoEvents,'createEvent','random0');
                                $('#createEvent select[name=random0]').val(event.continueTo.random[0].id).attr('selected','selected');
                            }
                        }
                    }
                }
                $('#continueFold').show();                
                break;
                
            case'end':
                break;                
        }
       
        $('#eventId').val(event.id);
        $('#btnCreateEvent').text('Update');
        $("#createEvents").modal('show');
    });    
    
    
    /******* DELETE **************/
    $(document).on('click','.deleteEvent', function(){
        var eventId = this.id.substr(11,this.id.length); //because del-button-name has 11 chars before id starts
        
        $.post('/crud', {
            'eventId':   eventId,
            'delete' :   'eventDel'
        }, function(data){
            
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                alertErr('#eventError', msg, errors);
            }else{
                alertSuccess('#eventSuccess', data['msg']);
                events = data['events'];
                updateEventList();
            }
        });
    });
    
    function updateEventList(){
      
        // get events within currently selected event-location from nav
        var locoEvents = getEventsByLoco(events, eLoco);
        var html='';
        
        for(var i=0; i<locoEvents.length; i++){
            html =  html+'<li class="list-group-item">'+
                        '<span id="event'+locoEvents[i].id+'" class="updateEvent clickable">'+locoEvents[i].name+'</span>'+
                        '<button class="deleteEvent pull-right btn btn-xs margin" id="eventBtnDel'+locoEvents[i].id+'">Delete</button>'+
                    '</li>';            
        }        
        $('#eventList').html(html);
    }
    
    /************ misc-functions *******************/
    
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