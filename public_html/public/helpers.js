/* 
 * This file contains helper-functions for general calculations, random picks etc...
 */

// get random index of given array
getRandomIndex = function(array){
   
    var rand = Math.floor(Math.random()* array.length);
    console.log('rand is '+rand+' from range 0-'+array.length);
    return array[rand];
};

