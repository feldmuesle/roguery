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

// display modal form for creating eents

$('#addEvent').click(function(){
        console.log('want to create an event?');
        //make sure the form is cleaned up
        $('#createEvent').trigger('reset');
        $('#createEvent input[name=form]').val('createEvent');
        $('#btnCreateEvent').text('create');
        $('#createEvent input:radio').removeProp('checked');
        
        // hide all fold-outs
        $('#isChoiceFold').hide();
        $('#isFlaggedFold').hide();
        $('#reqFlagFold').hide();
        $('#itemFold').hide();
        $('#attrFold').hide();
        $('#diceFold').hide();
        $('#choicesFold').hide();
        $('#continueFold').hide();
        $('#choiceRandFold').hide();
        $('#pickChoiceFold').hide();
        $('#succTriggerFold').hide();
        $('#failTriggerFold').hide();
        
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



function foldOutRadio(radio){
    // catch the change-event 
    $('#createEvent input[name='+radio+']').on('change',function (){
        console.log('you checked a radio');
        if($('#createEvent input[name='+radio+']:checked')){

            var value = $('#createEvent input[name='+radio+']:checked').val();

            switch(value){
                case'branchDice':
                    $('#choicesFold').hide();
                    $('#continueFold').hide();
                    $('#diceFold').show();
                    break;

                case'branchEnd':
                    $('#diceFold').hide();
                    $('#choicesFold').hide();
                    $('#continueFold').hide();
                    break;

                case'branchChoices':
                    $('#continueFold').hide();
                    $('#diceFold').hide();
                    $('#choicesFold').show();
                    break;

                case'branchContinue':
                    $('#diceFold').hide();
                    $('#choicesFold').hide();
                    $('#continueFold').show();
                    break;

                case'failLoco':
                    // show select, populated with locations
                    populateSelect(items, 'failTrigger');
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
                    populateSelect(items, 'continueTo');
                    break;

                case'continueEvent':
                    populateSelect(items, 'continueTo');
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

// make also dynamic radios from added inputs interactive
//for (var i=0; i<itemCounts; i++){
//    var name = 'itemAction'+i;
//    if(i== 0){
//        name = 'itemAction';
//    }    
//    $('#createEvent input[name='+name+']').on('change',function (){
//        if($('#createEvent input[name='+name+']:checked')){
//            var value = $('#createEvent input[name='+name+']:checked').val();
//            
//            switch(value){
//                
//                case'': 
//                    break;
//            }
//        }
//    });
//}

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
    
    var amount = '<div class="form-group col-xs-2 pull-right">'+
                    '<label>Amount</label><input type="text" class="form-control" name="attrNumb'+next+'">'
                  +'</div>';
    var options = '';
    for(var i=0; i<attributes.length; i++){
        options += '<option value="'+attributes[i]+'">'+attributes[i]+'</option>';
    }
    var select = '<select class="form-control" name="attr'+next+'">'+options+'</select>';
    var selectGroup = '<div class="form-group col-xs-10"><label>Choose another attribute</label>'+select+'</div>';
    var row2 = '<div id="attrRow'+next+'" class="row">'+selectGroup+'</div>';    
    
    $('#attribute').append(fold);
    $('#'+foldId+next).append(row2);
    $('#attrRow'+next).append(amount);
    
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
    populateSelect(items, 'choice'+next);   
    
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
       
       // get all values from form 
       var form = $('#createEvent input[name=form]').val();
       console.log(form);
       var location = $('#createEvent select[name=location]').val();
       var name = $('#createEvent input[name=name]').val();
       var text = $('#createEvent input[name=text]').val();
       var newPara = $('#createEvent input[name=newPara]').val();
       var isChoice = $('#createEvent input[name=isChoice]').val();
       var choiceText = $('#createEvent input[name=choiceText]').val();
       var isFlagged = $('#createEvent input[name=isFlagged]').val();
       var flagDesc = $('#createEvent input[name=flagDesc]').val();
       var reqFlag = $('#createEvent input[name=reqFlag]').val();
       var flag = $('#createEvent input[name=flag]').val();
       var useItem = $('#createEvent input[name=useItem]').val();
       var itemAction = $('#createEvent input[name=itemAction]').val();
       var itemPick = $('#createEvent select[name=item]').val();
       var attributes = $('#createEvent input[name=attributes]').val();
       var attrAction = $('#createEvent input[name=attrAction]').val();
       var attr = $('#createEvent input[name=attr]').val();
       var attrNumb = $('#createEvent input[name=attrNumb]').val();
       var branchType = $('#createEvent input[name=branchType]').val();
       var diceAttr = $('#createEvent input[name=branchType]').val();
       var difficulty = $('#createEvent input[name=difficulty]').val();
       var succTrigger = $('#createEvent input[name=succTrigger]').val();
       var success = $('#createEvent input[name=success]').val();
       var failTrigger = $('#createEvent input[name=failTrigger]').val();
       var failure = $('#createEvent input[name=failure]').val(); 
       var contin = $('#createEvent input[name=continue]').val(); 
       var continueTo = $('#createEvent input[name=continue]').val(); 
       var choices = $('#createEvent input[name=choices]').val();       
       var choiceNumb = $('#createEvent input[name=choiceNumb]').val();
       var choice = $('#createEvent input[name=choice]').val();
       
       
       if(isChoice){
           var choiceText = $('#createEvent input[name=choiceText]').val();
       }
       
       if(isFlagged){
           var flagDesc = $('#createEvent input[name=flagDesc]').val();
       }
       
       if(reqFlag){
           var flag = $('#createEvent input[name=flag]').val();
       }
       
       // if there are any items, push them in items-array
       if(useItem){
           var items = [];
           var item = {
               item     :   itemPick,
               action   :   itemAction
           };
       }
       
       var event = {
            'form'      :   form,
            'name'      :   name,
            'text'      :   text,
            'newPara'   :   newPara,
            'isChoice'  :   {
                    checked :   isChoice,
                    text    :   choiceText
                },
            'setFlag' :   {
                    checked :   isFlagged,
                    text    :   flagDesc
                },
            'item'    :   [{  item    :    {type:String, ref:'Item'},
                    action  :    {type:String, trim:true, lowercase:true}   
                }],
    reqFlag :   [{type: Schema.Types.ObjectId, ref:'Flag', index:true}],
    attributes : [{
                    attributes  :   {type:String, trim:true, lowercase:true},
                    action  :    {type:String, trim:true, lowercase:true},
                    amount  :   {type:Number, min:1, max:10}                    
                }],
    branch  : {
        type: {type:String, trim:true, lowercase:true},
        dices   :   {
            attribtues  :   {type:String, trim:true, lowercase:true},
            difficulty  :   {type:String, trim:true, lowercase:true},
            success     :   [{
                    type:   {type:String, trim:true, lowercase:true},
                    location : {type: Schema.Types.ObjectId, ref:'Location', index:true},
                    events  : [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
            }],
            failure :[{
                    type:   {type:String, trim:true, lowercase:true},
                    location : {type: Schema.Types.ObjectId, ref:'Location', index:true},
                    events  : [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
                    }]
        },
        continueTo  :{
                    event   : {type: Schema.Types.ObjectId, ref:'Event', index:true},
                    location   : {type: Schema.Types.ObjectId, ref:'Location', index:true}
        },
        choices:    {
            type    :   {type:String, trim:true, lowercase:true},
            amount  :  {type:Number, trim:true, lowercase:true},
            events  : []
        }    
    }
       };
       
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
                $('#CreateEvents').modal('hide');
                // reset modal-button again
                $('#createEvent input[name=form]').val('createEvent');
                $('#btnCreateEvent').text('create');
                
                // show success-message
                alertSuccess('#eventSuccess',data['msg']);
                events = data['events'];
                updateItemList();
                // clear all inputs in form
                $('#createEvent').trigger('reset');
                
            }
       });
       console.dir(events);
    });
    
    