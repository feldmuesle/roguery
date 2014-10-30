/*
this file contains all functions for displaying in the DOM
*/
//initialize screen - show starup-form, hide rest of game
$(function(){
    $('#game').hide();
    $('#chatWrapper').hide();
    $('#profile').hide();
    $('#playerlist').hide();
    $('#roomPlayerlist').hide();
    $('#gameSignup').hide();
    $('#alert').hide();
    $('#alertSum').hide();
    $('#validSum').hide();
    $('#pseudoInput').focus();
    $('.thumbnail').hide();
    $('#loadGame').click(function(){loadGame();});
    $('#loadGame1').click(function(){loadGame();});
    //$('#newGame').click(function(){slideGameSignup();});
    $('#startGame').click(function(){displayRandCharacter();});
    $('#btnChatSubmit').click(function(){sendMessage(); return;});
    $('#chatInput').keypress(function(e){
    
        var key = e.which;
    if(key == '13'){ //send message if user clicks enter
        sendMessage();
        return;
    }
});
});
// initialize game with random playing character - show in modal window
function displayRandCharacter(){
    console.log('show playing character');
    setRandCharacter();
    $('#displayCharacter').modal('show');
}
//create a random character
function createRandCharacter(){
    var rand = getRandomNumber(0,characters.length-1);
    var rand2 = getRandomNumber(0,characters.length-1);
    var values = getRandAttributes(MAXSUM,11);
    
    var character = {
        name : characters[rand].name,
        guild: characters[rand].guild,
        weapon: characters[rand2].weapon,
        inventory : [],
        attributes:{}
    };
    for(var key in characters[rand].attributes){
        character.attributes[key] = values[key];
    }
    console.dir(character);
        return character;
    };
    
    
// populate modal with random character data
function setRandCharacter(){
    var stats = [];
    var count = 0;
    character = createRandCharacter();
    console.dir(character);
    // get DOM-elemnts
    var inventory = $('#inventory');
    var display = $('#characterStats');
    // reset height
    $('#displayBody').height(300);
    //clear lists to make sure no old data is left
    display.html('');
    inventory.html('<dt class="dlHeading">Inventory</dt>');
    var name = '<dt>Name </dt><dd id="name">'+character.name+'</dd>';
    var guild = '<dt><span class="glyphicon glyphicon-flag"></span> Guild: </dt><dd>'+character.guild.name+'</dd>';
    var stamina = '<dt><span class="glyphicon glyphicon-heart"></span> Stamina </dt>'+
        '<dd id="stamina">'+character.attributes.stamina+'<span id="maxStam">/'+character.attributes.maxStam+'</span>'+
        '<span class="statDesc" id="staminaDesc"> moderate</span></dd>';
    var charisma='<dt><span class="glyphicon glyphicon-fire"></span> Charisma </dt>'+
        '<dd id="charisma">'+character.attributes.charisma+'<span class="statDesc" id="charismaDesc"> likeable</span></dd>';
    var duelling = '<dt><span class="glyphicon glyphicon-flash"></span> Duelling </dt>'+
        '<dd id="duelling">'+character.attributes.duelling+'<span class="statDesc" id="duellingDesc"> agile</span></dd>';
    var scouting = '<dt><span class="glyphicon glyphicon-move"></span> Scouting </dt>'+
        '<dd id="scouting">'+character.attributes.scouting+'<span class="statDesc" id="scoutingDesc"> lost</span></dd>';
    var heroism = '<dt><span class="glyphicon glyphicon-move"></span> Heroism </dt>'+
        '<dd id="heroism">'+character.attributes.heroism+'<span class="statDesc" id="heroismDesc"> wicked</span></dd>';
    var roguery = '<dt><span class="glyphicon glyphicon-fire"></span> Roguery </dt>'+
        '<dd id="roguery">'+character.attributes.roguery+'<span class="statDesc" id="rogueryDesc"> bad ass</span></dd>';
    var magic = '<dt><span class="glyphicon glyphicon-flash"></span> Magic </dt>'+
        '<dd id="magic">'+character.attributes.magic+'<span class="statDesc" id="magicDesc"> moderate</span></dd>';
    var healing = '<dt><span class="glyphicon glyphicon-move"></span> Healing </dt>'+
        '<dd id="healing">'+character.attributes.healing+'<span class="statDesc" id="healingDesc"> miserable</span></dd>';
    var luck = '<dt><span class="glyphicon glyphicon-fire"></span> Luck </dt>'+
        '<dd id="luck">lucky'+character.attributes.luck+'<span class="statDesc" id="luckDesc"> blessed</span></dd>';
    var streetwise = '<dt><span class="glyphicon glyphicon-fire"></span> Heroism </dt>'+
        '<dd id="streetwise">blank'+character.attributes.streetwise+'<span class="statDesc" id="streetwiseDesc"> blessed</span></dd>';
    var coins = '<dt><span class="glyphicon glyphicon-flash"></span> Coins </dt>'+
        '<dd id="coins">'+character.attributes.coins+'</dd>';
    
    stats.push(name, guild, stamina, charisma, duelling, scouting, heroism,
                    roguery, magic, healing, luck, streetwise, coins);
    
    // append all stats
    for(var i=0; i<stats.length; i++){
        display.append(stats[i]);
    }
    // fill inventory
    // append weapon first
    var weapon = '<dt><span class="glyphicon glyphicon-flash"></span> Weapon </dt>'+
    '<dd id="weapon">Trident</dd>';
    inventory.append(weapon);
    
    // if there are any items in inventory, append them
    if(character.inventory.length > 0){
        while (count < character.inventory.length){
            var item = '<dd id="weapon">'+character.inventory[count].name+'</dd>';
            inventory.append(item);
            count++;
        }
        // set height depending on the length of inventory
        $('#displayBody').height(300+(10*count));
    }
}
// get another random character
$('#character').click(function(){
    setRandCharacter();
});
    
// customize random character
$('#customize').click(function(){
    customizeCharacter(character);
    console.log(character);
});
    
// populate modal with update-form for character with data
function customizeCharacter(character){
    console.log('hello from character modal customization');
    console.dir(character.name);
    $('#characterForms').modal('show');

    // reset the form
    $('#customizeCharacter').trigger('reset');

    // when changing the range
    $('.range').on('change',function(){

        // populate value in input right to it
        var val = $(this).val();
        $(this).next('.value').val(val);
        var sum = validateSum(character.attributes);
        console.log('you are changing range');
    });
    
    $('#customizeCharacter input[name=name]').val(character.name);
    $('#customizeCharacter select[name=guild]').val(character.guild.name).attr('selected','selected');
    
        // loop through all attributes and set them according to character
    for(var key in character.attributes){
        if( key != 'something'){
            var attribute = $('#customizeCharacter input[name='+key+']').val(character.attributes[key]);
            attribute.next('input').val(character.attributes[key]);
        }
    }
    // check if attributes sum up - they should by default, but just in case
    var sum = validateSum(character.attributes);
    // set weapon
    $('#customizeCharacter select[name=weapon]').val(character.weapon.name).attr('selected','selected');
}
// get customized playing-character
function getCustomized (){
    var character = {};
    character.name = $('#customizeCharacter input[name=name]').val();
    character.guild = $('#customizeCharacter select[name=guild]').val();
    character.weapon = $('#customizeCharacter select[name=weapon]').val();
    character.inventory =[] ;
    character.attributes = {};
    
    for (var key in characters[0].attributes){ // characters[0} - use a character as mold for attributes
        console.log('get attributes from form: '+key);
        character.attributes[key] = $('#customizeCharacter input[name='+key+']').val();
    }
    console.log('updated character ');
    console.dir(character);
    return character;
}
// sum up all attribute-values
function sumAttributes(attribute){
    var sum = 0;
    for(var key in attribute){
        // take only real attributes
        if(key != 'maxStam'){
            var value = $('#customizeCharacter input[name='+key+']').next('input').val();
            console.log(key+' ='+value);
            sum += parseInt(value);
        }
    }
    console.log('sumAttribute: sum='+sum);
    return sum;
}
// set screen-height, hide startup-form and show the game!!
function gameInit(){
    setAutoHeight();
    $('#game').show();
    $('#profile').show();
    $('#playerlist').show();
    $('#roomPlayerlist').show();
    $('#chatWrapper').show();
    $('.thumbnail').show();
    $('#pseudoSet').hide();
    $('#chatInput').focus();
}
// display validation for sum up of attribute-values
function validateSum (attributes){
    var sum = sumAttributes(attributes);
    if(sum != MAXSUM){
        $('#validSum').hide();
        if(sum > MAXSUM){
            $('#alertSum').html('Your attributes sum up to '+sum+'. They must sum up to '+MAXSUM +' in order to play.');
        }else{
            $('#alertSum').html('Your attributes sum up to only '+sum+'. They must sum up to'+MAXSUM+' in order to play.');
        }
        $('#alertSum').show();
        return false;
    }else{
        $('#alertSum').hide();
        $('#validSum').html('Your attributes sum up to '+MAXSUM+' - You are ready to play!');
        $('#validSum').show();
        return true;
    }
}
// adjust height of chatlist to current window
function setAutoHeight(){
    var windowH = $(document).height();
    $('#sidebar').height(windowH);
    var sidebarH = $('#sidebar').height();
    console.log('window height is '+windowH);
    $('#chatWrapper').height(windowH -80);
}

