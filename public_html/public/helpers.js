/* 
 * This file contains helper-functions for general calculations, random picks etc...
 */

// get random index of given array
getRandomIndex = function(array){
   
    var rand = Math.floor(Math.random()* array.length);
    console.log('rand is '+rand+' from range 0-'+array.length);
    return array[rand];
};

// get random value within range
function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;

};

// set characters attributes random, but must add on to max
function getRandAttributes(max, attributesNum){
    var attributes = {};
    var stamina = getRandomNumber(5,18);
    var maxStam = getRandomNumber(stamina+1,20); // max must be always higher than stamina
    var currsum = stamina;
    
    attributes.stamina = stamina;
    attributes.maxStam = maxStam;
    
    var keys = ['charisma','duelling', 'scouting', 'roguery', 'magic', 'healing', 'luck'];
    
    for(var i=0; i < keys.length; i++) {
        
       attributes[keys[i]] = getRandomNumber(1, (max-currsum)/(keys.length-i));
       currsum += attributes[keys[i]];
       console.log('after '+keys[i]+', value='+attributes[keys[i]]+',cursum = '+currsum);
    }
    attributes.coins = max - currsum;
    console.log('coins cursum = '+currsum);
    console.log( 'random attributes generated: sum='+(max - currsum - parseInt(attributes.coins)));
    return attributes;  
};