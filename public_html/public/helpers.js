/* 
 * This file contains helper-functions for general calculations, random picks etc...
 */

// misc-functions for helping

// get index of assoc-array by key and value
getIndexByKeyValue = function(array, key, value){
//    console.log('key = '+key);
//    console.log('value='+value);
//    console.dir(array);
    for (var i = 0; i< array.length; i++){
        if (array[i][key] == value){
            return i;
        }        
    }
    return null;
};

// get random index of given array
getRandomIndex = function(array){
   
    var rand = Math.floor(Math.random()* array.length);
    console.log('rand is '+rand+' from range 0-'+array.length);
    return array[rand];
};

// get a certain record by its id
function getRecordById(recordArray, recordId){
    for(var i=0; i<recordArray.length; i++){
        if(recordArray[i].id == recordId){
            var record = recordArray[i];
            return record;
        }
    }
}



// get random value within range
function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;

};

// set characters attributes random, but must add on to max
function getRandAttributes(max){
    var attributes = {};
    var stamina = getRandomNumber(5,18);
    var maxStam = getRandomNumber(stamina+1,stamina+5); // max must be always higher than stamina (max 5 higher)
    var currsum = stamina;
    
    attributes.stamina = stamina;
    attributes.maxStam = maxStam;
    
    var keys = ['charisma','duelling', 'scouting', 'heroism', 'roguery',
                    'magic', 'healing', 'luck'];
    
    for(var i=0; i < keys.length; i++) {
        
       attributes[keys[i]] = getRandomNumber(1, (max-currsum)/(keys.length-i));
       currsum += attributes[keys[i]];
       console.log('after '+keys[i]+', value='+attributes[keys[i]]+',cursum = '+currsum);
    }
    attributes.streetwise = max - currsum;
    console.log('last attribute cursum = '+currsum);
    console.log( 'random attributes generated: sum='+(max - currsum - parseInt(attributes.streetwise)));
    return attributes;  
};

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// spinner for number-inputs

function inputSpinner(foldId, step, max, min){
    $('#'+foldId).find('.spinner .btn:first-of-type').unbind('click');
    $('#'+foldId).find('.spinner .btn:last-of-type').unbind('click');
        
    // arrow up
    $('#'+foldId).find('.spinner .btn:first-of-type').on('click', function(e) {
        e.preventDefault();
        var value = parseInt($('#'+foldId).find('.spinner input').val(), 10);
        // increase step to ten if value gets higher than 30
        if(value == 30)step =10;
        
        if ((value+step) <= max){
            $('#'+foldId).find('.spinner input').val( value+step);
        }
        console.log('hello from spinner-up in '+foldId);
    });
    // arrow down
    $('#'+foldId).find('.spinner .btn:last-of-type').on('click', function(e) {
        e.preventDefault();
        var value = parseInt($('#'+foldId).find('.spinner input').val(), 10);
        // increase step to ten if value gets higher than 30
        if(value == 30)step =10;
        
        if ((value-step) >= min){
            $('#'+foldId).find('.spinner input').val( value-step);
        }
        console.log('hello from spinner-down in '+foldId);
    });
};

// get all events associated with certain location
function getEventsByLoco(eventsArray, locationId){
    var events = [];

    for (var i = 0; i< eventsArray.length; i++){            
        if (eventsArray[i]['location'].id == locationId){
            events.push(eventsArray[i]);
        }        
    }
    return events;
}

function getChoicesOnly(eventsArray){
    var events = [];
    console.log('hello from get Choisesonly');
    for (var i = 0; i< eventsArray.length; i++){            
        if (eventsArray[i]['isChoice'] == true){        
            events.push(eventsArray[i]);
        }        
    }
    return events;
}

// populate a select dynamically 
function populateSelect(array, elementId, name){
    var select = $('#'+elementId+' select[name='+name+']');
    var options = '';
    for(var i=0; i<array.length; i++){
        options += '<option value="'+array[i].id+'">'+array[i].name+'</option>';
    }

    // first empty select, then populate it with the options
    $(select).html('');
    $(select).append(options);
}

// show error-alert depending on alertId
    function alertErr(alertId, msg, error){
        // make sure it's clean and empty
        $(alertId).text('');
        $(alertId).append('<h3>'+msg+'</h3>');
        $(alertId).append('<p>'+error+'</p>');
        $(alertId).slideDown('slow').fadeIn(3000, function(){
            setTimeout(function(){
                $(alertId).fadeOut({duration:1000, queue:false}).slideUp('slow');
            },5000);
            
        });
    }