/*
this file contains all functions for displaying in the DOM
*/
//initialize screen - show starup-form, hide rest of game
$(function(){
    $('#game').hide();
    $('#chatWrapper').hide();
    $('#profile').hide();
    $('#gameSignup').hide();
    $('#alert').hide();
    $('#alertSum').hide();
    $('#alertCharacter').hide();
    $('#validSum').hide();
//    $('#pseudoInput').focus();
//    $('.thumbnail').hide();
//    $('#loadGame').click(function(){loadGame();});
//    $('#loadGame1').click(function(){loadGame();});
    //$('#newGame').click(function(){slideGameSignup();});
    $('#startGame').click(function(){displayRandCharacter();});
    
});

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

function getStatsList(character){
    var stats =[];
               
        var name = '<dt>Name </dt><dd id="name">'+character.name+'</dd>';
        var guild = '<dt><span class="glyphicon glyphicon-flag"></span> Guild: </dt><dd>'+character.guild.name+'</dd>';
        var stamina = '<dt><span class="glyphicon glyphicon-heart"></span> Stamina </dt>'+
            '<dd id="stamina">'+character.attributes.stamina+'<span id="maxStam">/'+character.attributes.maxStam+'</span>'+
            '<span class="statDesc" id="staminaDesc"> '+getAttributDesc('stamina',character.attributes.stamina)+'</span></dd>';
        var charisma='<dt><span class="glyphicon glyphicon-fire"></span> Charisma </dt>'+
            '<dd id="charisma">'+character.attributes.charisma+
            '<span class="statDesc" id="charismaDesc"> '+getAttributDesc('charisma',character.attributes.charisma)+'</span></dd>';
        var duelling = '<dt><span class="glyphicon glyphicon-flash"></span> Duelling </dt>'+
            '<dd id="duelling">'+character.attributes.duelling+
            '<span class="statDesc" id="duellingDesc"> '+getAttributDesc('duelling',character.attributes.duelling)+'</span></dd>';
        var scouting = '<dt><span class="glyphicon glyphicon-move"></span> Scouting </dt>'+
            '<dd id="scouting">'+character.attributes.scouting+
            '<span class="statDesc" id="scoutingDesc"> '+getAttributDesc('scouting',character.attributes.scouting)+'</span></dd>';
        var heroism = '<dt><span class="glyphicon glyphicon-move"></span> Heroism </dt>'+
            '<dd id="heroism">'+character.attributes.heroism+
            '<span class="statDesc" id="heroismDesc"> '+getAttributDesc('heroism',character.attributes.heroism)+'</span></dd>';
        var roguery = '<dt><span class="glyphicon glyphicon-fire"></span> Roguery </dt>'+
            '<dd id="roguery">'+character.attributes.roguery+
            '<span class="statDesc" id="rogueryDesc"> '+getAttributDesc('roguery',character.attributes.roguery)+'</span></dd>';
        var magic = '<dt><span class="glyphicon glyphicon-flash"></span> Magic </dt>'+
            '<dd id="magic">'+character.attributes.magic+
            '<span class="statDesc" id="magicDesc"> '+getAttributDesc('magic',character.attributes.magic)+'</span></dd>';
        var healing = '<dt><span class="glyphicon glyphicon-move"></span> Healing </dt>'+
            '<dd id="healing">'+character.attributes.healing+
            '<span class="statDesc" id="healingDesc"> '+getAttributDesc('healing',character.attributes.healing)+'</span></dd>';
        var luck = '<dt><span class="glyphicon glyphicon-fire"></span> Luck </dt>'+
            '<dd id="luck">'+character.attributes.luck+
            '<span class="statDesc" id="luckDesc"> '+getAttributDesc('luck',character.attributes.luck)+'</span></dd>';
        var streetwise = '<dt><span class="glyphicon glyphicon-fire"></span> Streetwise </dt>'+
            '<dd id="streetwise"> '+character.attributes.streetwise+
            '<span class="statDesc" id="streetwiseDesc"> '+getAttributDesc('streetwise',character.attributes.streetwise)+'</span></dd>';
        var coins = '<dt><span class="glyphicon glyphicon-flash"></span> Coins </dt>'+
            '<dd id="coins">20</dd>';

        stats.push(name, guild, stamina, charisma, duelling, scouting, heroism,
                    roguery, magic, healing, luck, streetwise, coins);
                    
        return stats;
}

// display character with attributes
function displayPlayerStats(character){
        console.log('hello from display PlayerSats');
        
        var stats = getStatsList(character);        
        var playerstats = '<h3>Profile</h3>';
        
        for(var i=0; i< stats.length; i++){
            playerstats = playerstats + stats[i];            
        }
        $('#profile').html(playerstats);
    };
    
// update single attribute in  
function updatePlayerStats(attribute, newValue){
    console.log('hello from updatePlayerStats');

    if(attribute == 'stamina'){
        console.log('update stamina');
        // if its stamina, also display maxStam-span
        var maxStam = '<span id="maxStam">/'+character.attributes.maxStam+'</span>';
        $('#profile').find('#'+attribute).html(newValue+maxStam);
        return;
    }
    // pick the right dd-element
    $('#profile').find('#'+attribute).html(newValue);
}

/*********** Text-stream - story ***************/

// append li to text-window
function appendToChat(cssClass, text){
    $('<li class="'+cssClass+'">'+text+'</li>').hide().appendTo('#chatEntries').slideDown('fast');
}

/******* character generator ****************/

// initialize game with random playing character - show in modal window
function displayRandCharacter(){
    console.log('show random playing character');
    var opts = createRandOpts();
    character = createRandCharacter(opts);
    setCharacter(character);
    $('#displayCharacter').modal('show');
}
// display character when clicking on thumbnail
$('.thumbnail').click(function(){
    var charId = this.id.substr(5,this.id.length); // thumb = 5 chars
    character = getRecordById(characters, charId);
    setCharacter(character);
    $('#displayCharacter').modal('show');

});
// create rand name, pick random guild & weapon for clients get random character
function createRandOpts(){
    var rand1 = getRandomNumber(0,characters.length-1);
    var rand = getRandomNumber(0,characters.length-1);
    
    
    var opts = {
        weapon : characters[rand1].weapon,
        name : characters[rand].name,
        guild : characters[rand].guild
    };
    return opts;
}


//create a random character
function createRandCharacter(opts){        
    console.log('create random character');
    var character = {
        weapon :opts.weapon,
        name : opts.name,
        guild : opts.guild,
        inventory : [],
        attributes:{}
    };
      
    
    var values = getRandAttributes(MAXSUM);
    
    for(var key in values){
        character.attributes[key] = values[key];
    }
    // set maxStam to rand. more than stamina
    
    
    // set amount of coins to 20 as default
    character.attributes.coins = COINS;
    console.dir(character);
        return character;
    };
    

    
// get attribute-description depending on amount
var getAttributDesc = function(attribute, value){
    var key;;
    console.log('value is: '+value);
    
    switch(true){
        case(value <= 3):
            key = 'horrible';
            console.log('horrible');
            break;

        case((7 > value)&&(value>=4)):
            key = 'poor';
            console.log('poor');
            break;

        case((10 > value)&&(value>=7)):
            key = 'fair';
            console.log('fair');
            break;

        case((13 > value) && (value >=10)):
            key = 'alright';
            console.log('alright');
            break;    

        case((16 > value)&& (value >=13)):
            key = 'good';
            console.log('good');
            break;  
        
        case((21 > value) && (value >=16)):
              key = 'perfect';
              console.log('perfect');
              break;

        case(value >=21):
            key = 'excellent';
            console.log('excellent');
            break;    
    }      
    console.log('key is: '+key);
    console.log('attribute is '+attribute);
    
    return attrDesc[key][attribute];
};
    
// populate modal with random character data
function setCharacter(character){
    var stats = [];
    var count = 0;
    
    console.dir(character);
    // get DOM-elemnts
    var inventory = $('#inventory');
    var display = $('#characterStats');
    // reset height
    $('#displayBody').height(300);
    //clear lists to make sure no old data is left
    display.html('');
    inventory.html('<dt class="dlHeading">Inventory</dt>');
    console.log('image to display = '+character.guild.image);
    var stats = getStatsList(character);
    
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
    
    //set image according to guild
    $('#avatar').find('img').attr('src','./images/'+character.guild.image);
}

// get another random character
$('#character').click(function(){
    var opts = createRandOpts();
    character = createRandCharacter(opts);
    setCharacter(character);
});
    
// customize random character
$('#customize').click(function(){
    $('#customizeCharacter').trigger('reset');
    customizeCharacter(character);
    console.log(character);
});
    
// populate modal with update-form for character with data
function customizeCharacter(character){
    console.log('hello from character modal customization');
    console.dir(character);
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
    $('#customizeCharacter select[name=guild]').val(character.guild.id).attr('selected','selected');
    
    
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
    $('#customizeCharacter select[name=weapon]').val(character.weapon.id).attr('selected','selected');
}

// get customized playing-character
function getCustomized (){
    
    var character = {};
    character.name = $('#customizeCharacter input[name=name]').val();
    character.guild = $('#customizeCharacter select[name=guild]').val();
    character.weapon = $('#customizeCharacter select[name=weapon]').val();
    character.inventory =[] ;
    character.attributes = {};
    
    var attributes = ['stamina','charisma','duelling', 'scouting', 'heroism', 'roguery',
                    'magic', 'healing', 'luck', 'streetwise'];
    
    for (var i=0; i<attributes.length; i++){ 
        console.log('get attributes from form: '+attributes[i]);
        character.attributes[attributes[i]] = $('#customizeCharacter input[name='+attributes[i]+']').val();
    }
    
    // get random amount higher than 
    var stamina = character.attributes.stamina;
    var rand = getRandomNumber(1,5);
    character.attributes.maxStam = parseInt(stamina)+rand;
    console.log('stamina from getCustomized: '+stamina);
    console.log('maxstam from getCustomized: '+character.attributes.maxStam);
    character.attributes.coins = COINS;
    console.log('updated character ');
    console.dir(character);
    return character;
}

// sum up all attribute-values
function sumAttributes(attributes){
    var sum = 0;
    for(var key in attributes){
        // take only real attributes
        if(key != 'maxStam' && key != 'coins'){
            var value = $('#customizeCharacter input[name='+key+']').next('input').val();
            console.log(key+' ='+value);
            sum += parseInt(value);
        }
    }
    console.log('sumAttribute: sum='+sum);
    return sum;
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

