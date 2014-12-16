/* 
 * This file contains all functionality cencerning crud
 */

var MAXSUM = 100;
var COINS = 20;
var eLoco = 0;

$(document).ready(function(){
   
    // hide alert-windows for now
    $('#alertUser').hide();
    $('#alertEvent').hide();
    $('#alertLocation').hide();
    $('#alertItem').hide();    
    $('#alertWeapon').hide();
    $('#alertCharacter').hide();
    $('#alertGuild').hide();
    $('#userSuccess').hide();
    $('#eventSuccess').hide();
    $('#locationSuccess').hide();
    $('#itemSuccess').hide();    
    $('#weaponSuccess').hide();
    $('#charactersSuccess').hide();
    $('#guildSuccess').hide();
    $('#characterSuccess').hide();
    $('#userError').hide();
    $('#eventError').hide();
    $('#locationError').hide();
    $('#itemError').hide();    
    $('#weaponError').hide();
    $('#guildError').hide();
    $('#characterError').hide();
    
    // show automatically dropdown with first event-location
    var locoEvents = getEventsByLoco(events,locations[0].id);
    updateCrudList( locoEvents, 'eventList', 'event', 'updateEvent',
                    'eventBtnDel', 'deleteEvent');
    
    /******** SHOW MODAL FORMS ********/
    
    $('#addLocation').click(function(){
        
        //make sure the form is cleaned up
        $('#createLocation').trigger('reset');
        $('#createLocation input[name=form]').val('createLocation');
        $('#btnCreateLocation').text('create');
        var title = createTitleWithPlusIcon('new location');
        $('#createLocations').find('.modal-title').html(title);
        $("#createLocations").modal('show'); 
    });
    
    
    $('#addItem').click(function(){
        
        //make sure the form is cleaned up
        $('#createItem').trigger('reset');
        $('#createItem input[name=form]').val('createItem');
        $('#btnCreateItem').text('create');
        var title = createTitleWithPlusIcon('new item');
        $('#createItems').find('.modal-title').html(title);
        $("#createItems").modal('show'); 
    });
    
    $('#addWeapon').click(function(){
        
        //make sure the form is cleaned up
        $('#createWeapon').trigger('reset');
        $('#createWeapon input[name=form]').val('createWeapon');
        $('#btnCreateWeapon').text('create');
        var title = createTitleWithPlusIcon('new weapon');
        $('#createWeapons').find('.modal-title').html(title);
        $("#createWeapons").modal('show'); 
    });
    
    $('#addGuild').click(function(){
        
        //make sure the form is cleaned up
        $('#createGuild').trigger('reset');
        $('#createGuild input[name=form]').val('createGuild');
        $('#btnCreateGuild').text('create');
        var title = createTitleWithPlusIcon('new guild');
        $('#createGuilds').find('.modal-title').html(title);
        $("#createGuilds").modal('show'); 
    });
    
    $('#addCharacter').click(function(){
        
        //make sure the form is cleaned up
        var title = createTitleWithPlusIcon('new character');
        $('#characterForms').find('.modal-title').html(title);
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
        customizeCharacter(character);
        // empty the name-field though since we never want two characters with the same name
        $('#customizeCharacter input[name=name]').val('');
        $('#customizeCharacter input[name=form]').val('createCharacter');
        $('#btnPlay').text('create');
    });
        
    /******** CREATE ************/
    // create new location or update location
    $('#btnCreateLocation').click(function(){
    
        //empty validation-alert
        $('#alertLocation').text(''); 
        
       var form = $('#createLocation input[name=form]').val();
       var start = $('#createLocation input[name=start]');
       var name = $('#createLocation input[name=name]').val();
       var text = $('#createLocation textarea[name=text]').val();
       var event = $('#createLocation select[name=locationTrigger] option:selected').val();
       
       var location = {
           'form'   :   form,
           'name'   :   name,
           'text'   :   text,
           'event'  :   event
       };
       
       $(start).is(':checked')? location.start = true : location.start = false;
       
       if(form == 'updateLocation'){
           location.id = $('#locationId').val();
       }
             
       $.post('/crud',location, function(data){
           
            if(!data['success']){
                var errors = data['errors'];
                
                $('#alertLocation').show();
                $('#alertLocation').append('<h3>'+data['msg']+'</h3>');
                
                for(var key in errors){
                    var err = errors[key];
                    $('#alertLocation').append('<p>'+err.message+'</p>');
                }
            }else{
                
                // close modal 
                $('#createLocations').modal('hide');
                // reset modal-button again
                $('#createLocations input[name=form]').val('createLocation');
                $('#btnCreateLocation').text('create');
                var title = createTitleWithPlusIcon('new location');
                $('#createLocations').find('.modal-title').html(title);
                
                // show success-message
                alertSuccess('#locationSuccess',data['msg']);
                locations = data['locations'];
                updateCrudList( locations, 'locationList', 'location', 'updateLocation',
                    'locationBtnDel', 'deleteLocation');
                // update events-dropdown in navigation
                updateDropdown();
                // clear all inputs in form
                $('#createLocation').trigger('reset');                
            }
        });
    });    
    
    // create new character
    // btnPlay because form is also used by user when starting the game and customizing his character
    $('#btnPlay').click(function(){
        //empty validation-alert
        $('#alertCharacter').text('');
        var form = $('#customizeCharacter input[name=form]').val();
        var character = getCustomized(); 
                     
        if(form == 'updateCharacter'){
            character.id = $('#characterId').val();
        }
       
       var package ={
            'form'  : form,
            'character':  character
        };
       
       $.post('/crud',package, function(data){
          
            if(!data['success']){
                var errors = data['errors'];
                $('#alertCharacter').show();
                $('#alertCharacter').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    $('#alertCharacter').append('<p>'+err.message+'</p>');
                }
            }else{
                
                // close modal 
                $('#characterForms').modal('hide');
                // reset modal-button again
                $('#customizeCharacter input[name=form]').val('customize');
                $('#btnPlay').text('Play with this character');
                var title = createTitleWithPlusIcon('new character');
                $('#characterForms').find('.modal-title').html(title);
                
                // show success-message and update list
                alertSuccess('#characterSuccess',data['msg']);
                characters = data['characters'];
                updateCrudList( characters, 'charactersList', 'character', 'updateCharacter',
                    'characterBtnDel', 'deleteCharacter');
                // clear all inputs in form
                $('#customizeCharacter').trigger('reset');                
            }
       });       
    });
    
    $('#btnCreateGuild').click(function(){
    
        //empty validation-alert
        $('#alertGuild').text(''); 
        
       var form = $('#createGuild input[name=form]').val();
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
           guild.id = $('#guildId').val();
       }
       
       $.post('/crud',guild, function(data){
           
           if(!data['success']){
                var errors = data['errors'];
                $('#alertGuild').show();
                $('#alertGuild').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    $('#alertGuild').append('<p>'+err.message+'</p>');
                }
            }else{                
                // close modal 
                $('#createGuilds').modal('hide');
                
                // reset modal-button again
                $('#createGuild input[name=form]').val('createGuild');
                $('#btnCreateGuild').text('create');
                var title = createTitleWithPlusIcon('new guild');
                $('#createGuilds').find('.modal-title').html(title);
                
                // show success-message
                alertSuccess('#guildSuccess',data['msg']);
                guilds = data['guilds'];
                updateCrudList( guilds, 'guildList', 'guild', 'updateGuild',
                    'guildBtnDel', 'deleteGuild');
                // clear all inputs in form
                $('#createGuild').trigger('reset');                
            }
        });
    });
    
    $('#btnCreateItem').click(function(){
    
        //empty validation-alert
        $('#alertItem').text(''); 
        
        var form = $('#createItem input[name=form]').val();
        var name = $('#createItem input[name=name]').val();

        var item = {
            'form'   :   form,
            'name'   :   name
        };

        if(form == 'updateItem'){
            item.id = $('#itemId').val();
        }
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',item, function(data){
           if(!data['success']){
                var errors = data['errors'];
                $('#alertItem').show();
                $('#alertItem').append('<h3>'+data['msg']+'</h3>');
                
                for(var key in errors){
                    var err = errors[key];
                    $('#alertItem').append('<p>'+err.message+'</p>');
                }
                
            }else{                
                // close modal 
                $('#createItems').modal('hide');
                // reset modal-button again
                $('#createItems input[name=form]').val('createItem');
                $('#btnCreateItem').text('create');
                var title = createTitleWithPlusIcon('new item');
                $('#createItems').find('.modal-title').html(title);
                
                // show success-message
                alertSuccess('#itemSuccess',data['msg']);
                items = data['items'];
                updateCrudList( items, 'itemList', 'item', 'updateItem',
                    'itemBtnDel', 'deleteItem');
                // clear all inputs in form
                $('#createItem').trigger('reset');                
            }
       });
    });
    
    // create weapons
    $('#btnCreateWeapon').click(function(){
    
        //empty validation-alert
        $('#alertWeapon').text(''); 
        
       var form = $('#createWeapon input[name=form]').val();
       var name = $('#createWeapon input[name=name]').val();       
       
       var weapon = {
           'form'   :   form,
           'name'   :   name
       };
       
       if(form == 'updateWeapon'){
           weapon.id = $('#weaponId').val();
       }
       
       $.post('/crud',weapon, function(data){
           if(!data['success']){
                var errors = data['errors'];
                $('#alertWeapon').show();
                $('#alertWeapon').append('<h3>'+data['msg']+'</h3>');
                
                for(var key in errors){
                    var err = errors[key];
                    $('#alertWeapon').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // close modal 
                $('#createWeapons').modal('hide');
                // reset modal-button again
                $('#createWeapon input[name=form]').val('createWeapon');
                var title = createTitleWithPlusIcon('new weapon');
                $('#createWeapons').find('.modal-title').html(title);
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
    });
    
    $('#btnGradeUser').click(function(){
        //empty validation-alert
        $('#alertUser').text(''); 
        
        var form = $('#gradeUser input[name=form]').val();
        var password = $('#gradeUser input[name=password]').val();
        var id = $('#userId').val();

        var user = {
            'form'   :   form,
            'id'     :   id,
            'password':  password
        };

        $.post('/crud', user, function(data){
            
            if(!data['success']){
                var errors = data['errors'];
                $('#alertUser').show();
                $('#alertUser').append('<h3>'+data['msg']+'</h3>');

                for(var key in errors){
                    var err = errors[key];
                    $('#alertUser').append('<p>'+err.message+'</p>');
                }
            }else{
                // close modal 
                $('#gradeUsers').modal('hide');

                // show success-message
                alertSuccess('#userSuccess',data['msg']);
                users = data['users'];
                updateUserList();
                // clear all inputs in form
                $('#gradeUser').trigger('reset');
            }
        });
     });

     /********** UPDATE MODAL FORMS *********************/

     //button for showing modal form for upgrading user
     $(document).on('click','.downgradeUser', function(){
      
        // make sure form is clean
        $('#alertUser').hide();
        $('#gradeUser').trigger('reset');
        $('#gradeUsers').find('.modal-title').text('downgrade administrator');

        // get id from button-element and item-object from items-array
        var userId = this.id; // l
        var index = getIndexByKeyValue(users, '_id', userId);//  getRecordById(users, userId);
        var user = users[index];
        
        // set hidden field userId
        $('#userId').val(user._id);
        var msg = 'Are you sure you downgrade \''+user.username+'\' from administrator to user?';
        msg += '</br> If yes, please confirm by entering your password.';
        $('#adminSure').html(msg);
        $('#gradeUser input[name=form]').val('downgradeUser');
        $('#btnGradeUser').text('Downgrade');
        $("#gradeUsers").modal('show');
     });

     //button for showing modal form for upgrading user
     $(document).on('click','.upgradeUser', function(){
        
        // make sure form is clean
        $('#alertUser').hide();
        $('#gradeUser').trigger('reset');
        $('#gradeUsers').find('.modal-title').text('upgrade user');

        // get id from button-element and item-object from items-array
        var userId = this.id; 
        var index = getIndexByKeyValue(users, '_id', userId);//  getRecordById(users, userId);
        var user = users[index];
        
        // set hidden field userId
        $('#userId').val(user._id);
        var msg = 'Are you sure you want to make \''+user.username+'\' an administrator?';
        msg += '</br> If yes, please confirm by entering your password.';
        $('#adminSure').html(msg);
        $('#gradeUser input[name=form]').val('upgradeUser');
        $('#btnGradeUser').text('Upgrade');
        $("#gradeUsers").modal('show');
    });
    
    
    //button for showing modal form for updation item
    $(document).on('click','.updateLocation', function(){
        
        // make sure form is clean
        $('#alertLocation').hide();
        $('#createLocation').trigger('reset');
        $('#createLocations').find('.modal-title').text('update location');
        
        // get id from button-element and item-object from items-array
        var locationId = this.id.substr(8,this.id.length); // location = 8 chars
        var location = getRecordById(locations, locationId);
        
        //populate select with all events of this location
        var locoEvents = getEventsByLoco(events, locationId);
        populateSelect(locoEvents, 'createLocation', 'locationTrigger');
      
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
        $('#btnCreateLocation').text('Update');
        $("#createLocations").modal('show');
    });
    
    
    //button for showing modal form for updation item
    $(document).on('click','.updateItem', function(){
       
        // make sure form is clean
        $('#alertItem').hide();
        $('#createItem').trigger('reset');
        $('#createItems').find('.modal-title').text('update item');
        
        // get id from button-element and item-object from items-array
        var itemId = this.id.substr(4,this.id.length); // item = 4 chars
        var item = getRecordById(items, itemId);
 
        // populate item in modal form
        $('#createItem input[name=form]').val('updateItem');
        $('#createItem input[name=name]').val(item.name);
        $('#itemId').val(item.id);
        $('#btnCreateItem').text('Update');
        $("#createItems").modal('show');
    });
    
    //button for showing modal form for updation character
    $(document).on('click','.updateCharacter', function(){
     
        // make sure form is clean
        $('#alertCharacter').hide();
        $('#customizeCharacter').trigger('reset');
        $('#characterForms').find('.modal-title').text('update character');
        
        // get id from button-element and item-object from items-array
        var characterId = this.id.substr(9,this.id.length); // character = 9 chars
        var character = getRecordById(characters, characterId);
        
        // populate character in modal form
        customizeCharacter(character);
        $('#customizeCharacter input[name=form]').val('updateCharacter');
        $('#characterId').val(character.id);
        $('#btnPlay').text('Update');
    });
    
    //button for showing modal form for updation weapon
    $(document).on('click','.updateWeapon', function(){

        // make sure form is clean
        $('#alertWeapon').hide();
        $('#createWeapon').trigger('reset');
        $('#createWeapons').find('.modal-title').text('update weapon');
        
        // get id from button-element and item-object from items-array
        var weaponId = this.id.substr(6,this.id.length); // weapon = 6 chars
        var weapon = getRecordById(weapons, weaponId);
 
        // populate item weaponin modal form
        $('#createWeapon input[name=form]').val('updateWeapon');
        $('#createWeapon input[name=name]').val(weapon.name);
        $('#weaponId').val(weapon.id);
        $('#btnCreateWeapon').text('Update');
        $("#createWeapons").modal('show');
    });
    
    //button for showing modal form for updating guild
    $(document).on('click','.updateGuild', function(){
      
        // make sure form is clean
        $('#alertGuild').hide();
        $('#createGuild').trigger('reset');
        $('#createGuilds').find('.modal-title').html('update guild');
        populateSelect(locations, 'createGuild','location');
        
        // get id from span-element and item-object from items-array
        var guildId = this.id.substr(5,this.id.length); // guild = 5 chars
        var guild = getRecordById(guilds, guildId);
 
        // populate item weaponin modal form
        $('#createGuild input[name=form]').val('updateGuild');
        $('#createGuild input[name=name]').val(guild.name);
        $('#createGuild select[name=image]').val(guild.image).attr('selected', 'selected');
        $('#createGuild select[name=location]').val(guild.start).attr('selected', 'selected');
        $('#guildId').val(guild.id);
        $('#btnCreateGuild').text('Update');
        $("#createGuilds").modal('show');
    });
    
    function updateCrudList(entity, listId, linkId, linkClass, btnDelId, btnDelClass){      
        var html='';
        for(var i=0; i<entity.length; i++){
            html =  html+'<li class="list-group-item">'+
                        '<span id="'+linkId+entity[i].id+'" class="'+linkClass+' clickable">'+entity[i].name+'</span>'+
                        '<button class="'+btnDelClass+' pull-right btn btn-xs margin" id="'+btnDelId+entity[i].id+'">Delete</button>'+
                    '</li>';            
        }        
        $('#'+listId).html(html);
    }
    
    function updateUserList(){
        var html='';
        for(var i=0; i<users.length; i++){
            
            if(users[i].userRole === 'user'){
                html =  html+'<li class="list-group-item">'+users[i].username+
                        '<button class="upgradeUser pull-right btn btn-xs margin" id="'+users[i]._id+'">Make administrator</button>'+
                    '</li>';    
            }else{
                html =  html+'<li class="list-group-item">'+users[i].username+
                        '<button class="downgradeUser pull-right btn btn-xs margin" id="'+users[i]._id+'">Undo administrator</button>'+
                    '</li>'; 
            }                       
        }        
        $('#userList').html(html);
    }
  
 /**************************************************************/
 /********** DELETE ************/
 /**************************************************************/
 
 // button for deleting locations
    $(document).on('click','.deleteLocation', function(){
        
        var locationId = this.id.substr(14,this.id.length); //because del-button-name has 14 chars before id starts
   
        $.post('/crud', {
            'locationId':   locationId,
            'delete'    :   'locoDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                alertErr('#locationError', msg, errors);
            }else{
                alertSuccess('#locationSuccess', data['msg']);
                locations = data['locations'];
                updateCrudList( locations, 'locationList', 'location', 'updateLocation',
                    'locationBtnDel', 'deleteLocation');
                updateDropdown();
            }
        });
    });
 
 // button for deleting item
    $(document).on('click','.deleteItem', function(){
       
        var itemId = this.id.substr(10,this.id.length); //because del-button-name has 10 chars before id starts

        $.post('/crud', {
            'itemId'    :   itemId,
            'delete'   :    'itemDel'
        }, function(data){
            
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                alertErr('#itemError', msg, errors);
            }else{
                alertSuccess('#itemSuccess', data['msg']);
                items = data['items'];
                updateCrudList( items, 'itemList', 'item', 'showItem',
                    'itemBtnDel', 'deleteItem', 'itemBtn', 'updateItem');
            }
        });
    });
    
    // button for deleting guild
    $(document).on('click','.deleteGuild', function(){
        
        var guildId = this.id.substr(11,this.id.length); //because del-button-name has 11 chars before id starts
       
        $.post('/crud', {
            'guildId'    :   guildId,
            'delete'   :    'guildDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                alertErr('#guildError', msg, errors);
            }else{
                alertSuccess('#guildSuccess', data['msg']);
                guilds = data['guilds'];
                updateCrudList( guilds, 'guildList', 'guild', 'showGuild',
                    'guildBtnDel', 'deleteGuild', 'guildBtn', 'updateGuild');
            }
        });
    });
    
    // button for deleting weapon
    $(document).on('click','.deleteWeapon', function(){
        
        var weaponId = this.id.substr(11,this.id.length); //because del-button-name has 11 chars before id starts

        $.post('/crud', {
            'weaponId'    :   weaponId,
            'delete'   :    'weaponDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                alertErr('#weaponError', msg, errors);
            }else{
                alertSuccess('#weaponSuccess', data['msg']);
                weapons = data['weapons'];
                updateCrudList( weapons, 'weaponList', 'weapon', 'updateWeapon',
                    'weaponBtnDel', 'deleteWeapon');
            }
        });
    });
    
    
    // button for deleting character
    $(document).on('click','.deleteCharacter', function(){
        
        var charId = this.id.substr(15,this.id.length); //because del-button-name has 15 chars before id starts
     
        $.post('/crud', {
            'charId'    :   charId,
            'delete'   :    'charDel'
        }, function(data){
            if(!data['success']){
                var errors = data['errors'];
                var msg = data['msg'];
                alertErr('#characterError', msg, errors);
            }else{
                alertSuccess('#characterSuccess', data['msg']);
                characters = data['characters'];
                updateCrudList( characters, 'charactersList', 'character', 'updateCharacter',
                    'characterBtnDel', 'deleteCharacter');
            }
        });
    });
    
    /************ navigation *****************/
    $(document).on('click','.eLoco', function(){
        // get locationId
        eLoco = this.id.substr(5,this.id.length); // eLoco = 5 chars
        var locoEvents = getEventsByLoco(events,eLoco);

        updateCrudList( locoEvents, 'eventList', 'event', 'updateEvent',
                     'eventBtnDel', 'deleteEvent');
    });
    
    // set eLoco to the automated active location when page reloads
    var eLocoDefault = $('#autoSelect').children('a').attr('id');
    eLoco = eLocoDefault.substr(5,eLocoDefault.length); // eLoco = 5 chars
    
    // update events-dropdown 
    function updateDropdown(){
    
        var dropdown = $('#eventDrop').html('');
        for(var i=0; i<locations.length; i++){
            var li = '';
            if(i === 0){
                li = '<li id="autoSelect" class="active">'+
                    '<a id="eLoco'+locations[i].id+'" class="eLoco" href="#tab1" data-toggle="tab">'+locations[i].name+'</a>'+
                '</li>';
            }else{
                li ='<li class="">'+
                    '<a id="eLoco'+locations[i].id+'" class="eLoco" href="#tab1" data-toggle="tab">'+locations[i].name+'</a>'+
                '</li>';
            }
           $(dropdown).append(li);
        }
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
    
});// document.ready end


