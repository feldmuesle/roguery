/* 
 * This file contains all functionality cencerning crud
 */

var MAXSUM = 130;

$(document).ready(function(){
    
    // hide alert-windows for now
    $('#alertEvent').hide(); 
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
    
    /******** SHOW MODAL FORMS ********/
    
    
    
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
        $('#customizeCharacter').trigger('reset');
        $('#customizeCharacter input[name=form]').val('createCharacter');
        $('#btnPlay').text('create');
        var character = createRandCharacter();
        customizeCharacter(character);
        // empty the name-field though since we never want two characters with the same name
        $('#customizeCharacter input[name=name]').val('');
        $("#characterForms").modal('show'); 
    });

        
    /******** CREATE ************/
    
    
    
    
    // create new character
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
                updateItemList();
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
       
       var guild = {
           'form'   :   form,
           'name'   :   name
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
                updateItemList();
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
                updateItemList();
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
                $('#createWeapon').modal('hide');
                // reset modal-button again
                $('#createWeapon input[name=form]').val('createWeapon');
                $('#btnCreateWeapon').text('create');
                
                // show success-message
                alertSuccess('#weaponSuccess',data['msg']);
                weapons = data['weapons'];
                updateItemList();
                // clear all inputs in form
                $('#createWeapon').trigger('reset');
                
            }
       });
       console.dir(weapons);
    });
    
    /********** UPDATE MODAL FORMS *********************/
    
    //button for showing modal form for updation item
    $(document).on('click','.updateItem', function(){
        console.log('want to update item?');
        // make sure form is clean
        $('#alertItem').hide();
        $('#createItem').trigger('reset');
        
        // get id from button-element and item-object from items-array
        var itemId = this.id.substr(7,this.id.length); // btnItem = 7 chars
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
        $('#alertItem').hide();
        $('#customizeCharacter').trigger('reset');
        
        // get id from button-element and item-object from items-array
        var characterId = this.id.substr(12,this.id.length); // btnItem = 12 chars
        var character = getRecordById(characters, characterId);
        console.log('characterId to update: '+characterId);
 
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
        var weaponId = this.id.substr(9,this.id.length); // btnWeapon = 9 chars
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
        
        // get id from button-element and item-object from items-array
        var guildId = this.id.substr(8,this.id.length); // btnGuild = 8 chars
        var guild = getRecordById(guilds, guildId);
        console.log('guildId to update: '+guildId);
 
        // populate item weaponin modal form
        $('#createGuild input[name=form]').val('updateGuild');
        $('#createGuild input[name=name]').val(guild.name);
        $('#guildId').val(guild.id);

        console.log(guilds);
        $('#btnCreateGuild').text('Update');
        $("#createGuilds").modal('show');
    });
    
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
    
    
});// document.ready end

