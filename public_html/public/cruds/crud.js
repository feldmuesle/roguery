/* 
 * This file contains all functionality cencerning crud
 */

var MAXSUM = 100;
var COINS = 20;
var eLoco = 0;

$(document).ready(function(){
    
    // hide alert-windows for now
    $('#alertEvent').hide();
    $('#alertLocation').hide();
    $('#alertItem').hide();    
    $('#alertWeapon').hide();
    $('#alertCharacter').hide();
    $('#alertGuild').hide();
    $('#eventSuccess').hide();
    $('#locationSuccess').hide();
    $('#itemSuccess').hide();    
    $('#weaponSuccess').hide();
    $('#charactersSuccess').hide();
    $('#guildSuccess').hide();
    $('#characterSuccess').hide();
    $('#eventError').hide();
    $('#locationError').hide();
    $('#itemError').hide();    
    $('#weaponError').hide();
//    $('#charactersError').hide();
    $('#guildError').hide();
    $('#characterError').hide();
    
    /******** SHOW MODAL FORMS ********/
    
    $('#addLocation').click(function(){
        console.log('want to create a location?');
        //make sure the form is cleaned up
        $('#createLocation').trigger('reset');
        $('#createLocation input[name=form]').val('createLocation');
        $('#btnCreateLocation').text('create');
        $("#createLocations").modal('show'); 
    });
    
    
    $('#addItem').click(function(){
        console.log('want to create an item?');
        //make sure the form is cleaned up
        $('#createItem').trigger('reset');
        $('#createItem input[name=form]').val('createItem');
        $('#btnCreateItem').text('create');
        $("#createItems").modal('show'); 
    });
    
    $('#addWeapon').click(function(){
        console.log('want to create an weapon?');
        //make sure the form is cleaned up
        $('#createWeapon').trigger('reset');
        $('#createWeapon input[name=form]').val('createWeapon');
        $('#btnCreateWeapon').text('create');
        $("#createWeapons").modal('show'); 
    });
    
    $('#addGuild').click(function(){
        console.log('want to create an guild?');
        //make sure the form is cleaned up
        $('#createGuild').trigger('reset');
        $('#createGuild input[name=form]').val('createGuild');
        $('#btnCreateGuild').text('create');
        $("#createGuilds").modal('show'); 
    });
    
    $('#addCharacter').click(function(){
        console.log('want to create an guild?');
        //make sure the form is cleaned up
//        $('#customizeCharacter').trigger('reset');
        $('#customizeCharacter input[name=form]').val('createCharacter');
        $('#btnPlay').text('create');
        
        // create a random character
        var rand = getRandomNumber(0,weapons.length-1);
        var rand1 = getRandomNumber(0,guilds.length-1);  
        var opts = {
            weapon :weapons[rand],
            name : 'O\'my Nahme',
            guild : guilds[rand1]
        };
        
        var character = createRandCharacter(opts);
        console.log('crud-character: ');
                console.dir(character);
        customizeCharacter(character);
        // empty the name-field though since we never want two characters with the same name
        $('#customizeCharacter input[name=name]').val('');
        $('#customizeCharacter input[name=form]').val('createCharacter');
        $('#btnPlay').text('create');
//        $("#characterForms").modal('show'); 
    });

        
    /******** CREATE ************/
    // create new location or update location
    $('#btnCreateLocation').click(function(){
    
        //empty validation-alert
        $('#alertLocation').text(''); 
        
       var form = $('#createLocation input[name=form]').val();
       console.log(form);
       var start = $('#createLocation input[name=start]');
       var name = $('#createLocation input[name=name]').val();
       var text = $('#createLocation textarea[name=text]').val();
       var event = $('#createLocation select[name=locationTrigger] option:selected').val();
       console.log(start);
       
       var location = {
           'form'   :   form,
           'name'   :   name,
           'text'   :   text,
           'event'  :   event
       };
       
       $(start).is(':checked')? location.start = true : location.start = false;
       
       if(form == 'updateLocation'){
           console.log('location to update: id '+$('#locationId').val());
           location.id = $('#locationId').val();
       }
       console.log(location);
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',location, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertLocation').show();
                $('#alertLocation').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                    $('#alertLocation').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#createLocations').modal('hide');
                // reset modal-button again
                $('#createLocations input[name=form]').val('createLocation');
                $('#btnCreateLocation').text('create');
                
                // show success-message
                alertSuccess('#locationSuccess',data['msg']);
                locations = data['locations'];
                updateCrudList( locations, 'locationList', 'location', 'updateLocation',
                    'locationBtnDel', 'deleteLocation');
                // clear all inputs in form
                $('#createLocation').trigger('reset');
                
            }
       });
       console.dir(locations);
    });
    
    
    // create new character
    // btnPlay because form is also used by user when starting the game and customizing his character
    $('#btnPlay').click(function(){
        //empty validation-alert
        $('#alertCharacter').text('');
        var form = $('#customizeCharacter input[name=form]').val();
        var character = getCustomized(); 
                     
        if(form == 'updateCharacter'){
           console.log('character to update: id '+$('#characterId').val());
           character.id = $('#characterId').val();
           console.log(character.id);
       }
       
       var package ={
            'form'  : form,
            'character':  character
        };
       
       $.post('/crud',package, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertCharacter').show();
                $('#alertCharacter').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                    $('#alertCharacter').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#characterForms').modal('hide');
                // reset modal-button again
                $('#customizeCharacter input[name=form]').val('customize');
                $('#btnPlay').text('Play with this character');
                
                // show success-message
                alertSuccess('#characterSuccess',data['msg']);
                characters = data['characters'];
                updateCrudList( characters, 'charactersList', 'character', 'updateCharacter',
                    'characterBtnDel', 'deleteCharacter');
                // clear all inputs in form
                $('#customizeCharacter').trigger('reset');
                
            }
       });
       console.dir(character);
       
    });
    
    $('#btnCreateGuild').click(function(){
    
        //empty validation-alert
        $('#alertGuild').text(''); 
        
       var form = $('#createGuild input[name=form]').val();
       console.log(form);
       var name = $('#createGuild input[name=name]').val();
       var image = $('#createGuild select[name=image]').val();
       var location = $('#createGuild select[name=location]').val();
       
       var guild = {
           'form'   :   form,
           'name'   :   name,
           'image'  :   image,
           'location':  location
       };
       
       if(form == 'updateGuild'){
           console.log('guild to update: id '+$('#guildId').val());
           guild.id = $('#guildId').val();
           console.log(guild.id);
       }
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',guild, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertGuild').show();
                $('#alertGuild').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                    $('#alertGuild').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#createGuilds').modal('hide');
                // reset modal-button again
                $('#createGuild input[name=form]').val('createGuild');
                $('#btnCreateGuild').text('create');
                
                // show success-message
                alertSuccess('#guildSuccess',data['msg']);
                guilds = data['guilds'];
                updateCrudList( guilds, 'guildList', 'guild', 'updateGuild',
                    'guildBtnDel', 'deleteGuild');
                // clear all inputs in form
                $('#createGuild').trigger('reset');
                
            }
       });
       console.dir(guild);
    });
    
    $('#btnCreateItem').click(function(){
    
        //empty validation-alert
        $('#alertItem').text(''); 
        
       var form = $('#createItem input[name=form]').val();
       console.log(form);
       var name = $('#createItem input[name=name]').val();
       
       
       var item = {
           'form'   :   form,
           'name'   :   name
       };
       
       if(form == 'updateItem'){
           console.log('item to update: id '+$('#itemId').val());
           item.id = $('#itemId').val();
       }
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',item, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertItem').show();
                $('#alertItem').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                    $('#alertItem').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#createItems').modal('hide');
                // reset modal-button again
                $('#createItems input[name=form]').val('createItem');
                $('#btnCreateItem').text('create');
                
                // show success-message
                alertSuccess('#itemSuccess',data['msg']);
                items = data['items'];
                updateCrudList( items, 'itemList', 'item', 'updateItem',
                    'itemBtnDel', 'deleteItem');
                // clear all inputs in form
                $('#createItem').trigger('reset');
                
            }
       });
       console.dir(item);
    });
    
    // create weapons
    $('#btnCreateWeapon').click(function(){
    
        //empty validation-alert
        $('#alertWeapon').text(''); 
        
       var form = $('#createWeapon input[name=form]').val();
       console.log(form);
       var name = $('#createWeapon input[name=name]').val();
       
       
       var weapon = {
           'form'   :   form,
           'name'   :   name
       };
       
       if(form == 'updateWeapon'){
           console.log('item to update: id '+$('#weaponId').val());
           weapon.id = $('#weaponId').val();
       }
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',weapon, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertWeapon').show();
                $('#alertWeapon').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                    $('#alertWeapon').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#createWeapons').modal('hide');
                // reset modal-button again
                $('#createWeapon input[name=form]').val('createWeapon');
                $('#btnCreateWeapon').text('create');
                
                // show success-message
                alertSuccess('#weaponSuccess',data['msg']);
                weapons = data['weapons'];
                updateCrudList( weapons, 'weaponList', 'weapon', 'updateWeapon',
                    'weaponBtnDel', 'deleteWeapon');
                // clear all inputs in form
                $('#createWeapon').trigger('reset');
                
            }
       });
       console.dir(weapons);
    });
    
    /********** UPDATE MODAL FORMS *********************/
    //button for showing modal form for updation item
    $(document).on('click','.updateLocation', function(){
        console.log('want to update location?');
        // make sure form is clean
        $('#alertLocation').hide();
        $('#createLocation').trigger('reset');
        
        // get id from button-element and item-object from items-array
        var locationId = this.id.substr(8,this.id.length); // location = 8 chars
        var location = getRecordById(locations, locationId);
        console.log('locationId to update: '+locationId);
        console.log(locations);
        
        //populate select with all events of this location
        var locoEvents = getEventsByLoco(events, locationId);
        populateSelect(locoEvents, 'createLocation', 'locationTrigger');
        console.log('locoEvents set');
        // populate item in modal form
        $('#createLocation input[name=form]').val('updateLocation');
        $('#createLocation input[name=name]').val(location.name);
        $('#createLocation textarea[name=text]').html(location.text);
        if(location.event){
            $('#createLocation select[name=locationTrigger]').val(location.event.id).attr('selected', 'selected');
        }
        
        
        if(location.start){
            $('#createLocation input[name=start]').val(location.start).attr('checked', true);
        }        
        $('#locationId').val(locationId);

        console.log(location);
        $('#btnCreateLocation').text('Update');
        $("#createLocations").modal('show');
    });
    
    
    //button for showing modal form for updation item
    $(document).on('click','.updateItem', function(){
        console.log('want to update item?');
        // make sure form is clean
        $('#alertItem').hide();
        $('#createItem').trigger('reset');
        
        // get id from button-element and item-object from items-array
        var itemId = this.id.substr(4,this.id.length); // item = 4 chars
        var item = getRecordById(items, itemId);
        console.log('itemId to update: '+itemId);
 
        // populate item in modal form
        $('#createItem input[name=form]').val('updateItem');
        $('#createItem input[name=name]').val(item.name);
        $('#itemId').val(item.id);

        console.log(item);
        $('#btnCreateItem').text('Update');
        $("#createItems").modal('show');
    });
    
    //button for showing modal form for updation character
    $(document).on('click','.updateCharacter', function(){
        console.log('want to update character?');
        // make sure form is clean
        $('#alertCharacter').hide();
        $('#customizeCharacter').trigger('reset');
        
        // get id from button-element and item-object from items-array
        var characterId = this.id.substr(9,this.id.length); // character = 9 chars
        var character = getRecordById(characters, characterId);
        console.log('characterId to update: '+characterId);
        console.dir(character);
        // populate character in modal form
        customizeCharacter(character);
        $('#customizeCharacter input[name=form]').val('updateCharacter');
        $('#characterId').val(character.id);

        console.log(character);
        $('#btnPlay').text('Update');
    });
    
    //button for showing modal form for updation weapon
    $(document).on('click','.updateWeapon', function(){
        console.log('want to update weapon?');
        // make sure form is clean
        $('#alertWeapon').hide();
        $('#createWeapon').trigger('reset');
        
        // get id from button-element and item-object from items-array
        var weaponId = this.id.substr(6,this.id.length); // weapon = 6 chars
        var weapon = getRecordById(weapons, weaponId);
        console.log('weaponId to update: '+weaponId);
 
        // populate item weaponin modal form
        $('#createWeapon input[name=form]').val('updateWeapon');
        $('#createWeapon input[name=name]').val(weapon.name);
        $('#weaponId').val(weapon.id);

        console.log(weapon);
        $('#btnCreateWeapon').text('Update');
        $("#createWeapons").modal('show');
    });
    
    //button for showing modal form for updating guild
    $(document).on('click','.updateGuild', function(){
        console.log('want to update guild?');
        // make sure form is clean
        $('#alertGuild').hide();
        $('#createGuild').trigger('reset');
        
        // get id from span-element and item-object from items-array
        var guildId = this.id.substr(5,this.id.length); // guild = 5 chars
        var guild = getRecordById(guilds, guildId);
        console.log('guildId to update: '+guildId);
 
        // populate item weaponin modal form
        $('#createGuild input[name=form]').val('updateGuild');
        $('#createGuild input[name=name]').val(guild.name);
        $('#createGuild select[name=image]').val(guild.image).attr('selected', 'selected');
        $('#createGuild select[name=location]').val(guild.start).attr('selected', 'selected');
        $('#guildId').val(guild.id);

        console.log(guilds);
        $('#btnCreateGuild').text('Update');
        $("#createGuilds").modal('show');
    });
    
    function updateCrudList(entity, listId, linkId, linkClass, btnDelId, btnDelClass){
        console.log('hello from update crud list');
        var html='';
        for(var i=0; i<entity.length; i++){
            html =  html+'<li class="list-group-item">'+
                        '<span id="'+linkId+entity[i].id+'" class="'+linkClass+'">'+entity[i].name+'</span>'+
                        '<button class="'+btnDelClass+' pull-right btn btn-xs margin" id="'+btnDelId+entity[i].id+'">Delete</button>'+
                    '</li>';            
        }
        
        $('#'+listId).html(html);
    }
  
 /**************************************************************/
 /********** DELETE ************/
 /**************************************************************/
 
 // button for deleting locations
    $(document).on('click','.deleteLocation', function(){
        
        console.log('want to delete?');
        var locationId = this.id.substr(14,this.id.length); //because del-button-name has 14 chars before id starts
        console.log('locationId to delete: '+locationId);
        $.post('/crud', {
            'locationId':   locationId,
            'delete'    :   'locoDel'
        }, function(data){
            console.log('hello back from server.');
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                console.log(errors);
                alertErr('#locationError', msg, errors);
            }else{
                alertSuccess('#locationSuccess', data['msg']);
                locations = data['locations'];
                updateCrudList( locations, 'locationList', 'location', 'updateLocation',
                    'locationBtnDel', 'deleteLocation');
                console.log(data['locations']);
            }
        });

    });
 
 // button for deleting item
    $(document).on('click','.deleteItem', function(){
        
        console.log('want to delete?');
        var itemId = this.id.substr(10,this.id.length); //because del-button-name has 10 chars before id starts
        console.log('itemId to delete: '+itemId);
        $.post('/crud', {
            'itemId'    :   itemId,
            'delete'   :    'itemDel'
        }, function(data){
            console.log('hello back from server.');
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                console.log(errors);
                alertErr('#itemError', msg, errors);
            }else{
                alertSuccess('#itemSuccess', data['msg']);
                items = data['items'];
                updateCrudList( items, 'itemList', 'item', 'showItem',
                    'itemBtnDel', 'deleteItem', 'itemBtn', 'updateItem');
                console.log(data['items']);
            }
        });

    });
    
    // button for deleting guild
    $(document).on('click','.deleteGuild', function(){
        
        console.log('want to delete?');
        var guildId = this.id.substr(11,this.id.length); //because del-button-name has 11 chars before id starts
        console.log('guildId to delete: '+guildId);
        $.post('/crud', {
            'guildId'    :   guildId,
            'delete'   :    'guildDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                console.log(errors);
                alertErr('#guildError', msg, errors);
            }else{
                alertSuccess('#guildSuccess', data['msg']);
                guilds = data['guilds'];
                updateCrudList( guilds, 'guildList', 'guild', 'showGuild',
                    'guildBtnDel', 'deleteGuild', 'guildBtn', 'updateGuild');
                console.log(data['guilds']);
            }
        });

    });
    
    // button for deleting weapon
    $(document).on('click','.deleteWeapon', function(){
        
        console.log('want to delete?');
        var weaponId = this.id.substr(11,this.id.length); //because del-button-name has 11 chars before id starts
        console.log('weaponId to delete: '+weaponId);
        $.post('/crud', {
            'weaponId'    :   weaponId,
            'delete'   :    'weaponDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                console.log(errors);
                alertErr('#weaponError', msg, errors);
            }else{
                alertSuccess('#weaponSuccess', data['msg']);
                weapons = data['weapons'];
                updateCrudList( weapons, 'weaponList', 'weapon', 'updateWeapon',
                    'weaponBtnDel', 'deleteWeapon');
                console.log(data['weapons']);
            }
        });

    });
    
    
    // button for deleting character
    $(document).on('click','.deleteCharacter', function(){
        
        console.log('want to delete?');
        var charId = this.id.substr(15,this.id.length); //because del-button-name has 15 chars before id starts
        console.log('charId to delete: '+charId);
        $.post('/crud', {
            'charId'    :   charId,
            'delete'   :    'charDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                console.log(errors);
                alertErr('#characterError', msg, errors);
            }else{
                alertSuccess('#characterSuccess', data['msg']);
                characters = data['characters'];
                updateCrudList( characters, 'charactersList', 'character', 'updateCharacter',
                    'characterBtnDel', 'deleteCharacter');
                console.log(data['characters']);
            }
        });

    });
    
    /************ navigation *****************/
    $(document).on('click','.eLoco', function(){
       console.log('hello from dropdown');
       // get locationId
       eLoco = this.id.substr(5,this.id.length); // eLoco = 5 chars
       var locoEvents = getEventsByLoco(events,eLoco);
       console.dir(locoEvents);
       updateCrudList( locoEvents, 'eventList', 'event', 'updateEvent',
                    'eventBtnDel', 'deleteEvent');
    });
    
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

    
    
});// document.ready end


