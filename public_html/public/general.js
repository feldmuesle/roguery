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
       $('#pseudoInput').focus();
       $('.thumbnail').hide();
       $('#loadGame').click(function(){loadGame();});
       $('#loadGame1').click(function(){loadGame();});
       //$('#newGame').click(function(){slideGameSignup();});
       $('#startGame').click(function(){displayRandCharacter();});
       $('#btnChatSubmit').click(function(){sendMessage(); return;});
       $('#chatInput').keypress(function(e){
          var key = e.which;
          if(key == '13'){  //send message if user clicks enter
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
    
function setRandCharacter(){
    var stats = [];
    var count = 0;
    var character = getRandomIndex(characters);
    console.log(character);
    
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
    var roguery = '<dt><span class="glyphicon glyphicon-fire"></span> Roguery </dt>'+
                    '<dd id="roguery">'+character.attributes.roguery+'<span class="statDesc" id="rogueryDesc"> bad ass</span></dd>';
    var magic = '<dt><span class="glyphicon glyphicon-flash"></span> Magic </dt>'+
            '<dd id="magic">'+character.attributes.magic+'<span class="statDesc" id="magicDesc"> moderate</span></dd>';
    var healing = '<dt><span class="glyphicon glyphicon-move"></span> Healing </dt>'+
                    '<dd id="healing">'+character.attributes.healing+'<span class="statDesc" id="healingDesc"> miserable</span></dd>';
    var luck = '<dt><span class="glyphicon glyphicon-fire"></span> Luck </dt>'+
                '<dd id="luck">lucky'+character.attributes.luck+'<span class="statDesc" id="staminaDesc"> blessed</span></dd>';
    var coins = '<dt><span class="glyphicon glyphicon-flash"></span> Coins </dt>'+
                    '<dd id="coins">'+character.attributes.coins+'</dd>';
    
    stats.push(name, guild, stamina, charisma, duelling, scouting, 
    roguery, magic, healing, luck, coins);
    
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



