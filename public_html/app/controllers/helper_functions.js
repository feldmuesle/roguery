/* 
 * This file contains helper-functions for general calculations, checking values 
 * and other stuff we need over and over again
 */


/********* validation-helpers **********************/

// check if value is empty
exports.valEmpty = function(val){
    if(val){
        return val.length > 0;
    }else {
        return false;
    }    
};

// strip all 'mal-chars' and replace with ''
exports.sanitizeString = function(string){
    
    if(typeof stringValue && string){
        return string.replace(/[&<>${}\[\]/]/g,'');
    }    
};

// strip everything thats not a number
exports.sanitizeNumber = function (numb){
    if(numb !='undefined' && numb != null){
        return numb.replace(/[^0-9]/g, '');
    }    
};

/********** calculations *******************/

// get index of assoc-array by key and value
exports.getIndexByKeyValue = function(array, key, value){

    for (var i = 0; i< array.length; i++){
        if (array[i][key] == value){
            return i;
        }        
    }
    return null;
};

// find out if an array does not match
exports.findNoMatchInArrays = function(array1, array2){
    
    var length1 = array1.length;
    var length2 = array2.length;
    
    for (var i = 0; i< length1; i++){
        
        for(var j=0; j<length2; j++){
            var item1 = array1[i].toString();
            var item2 = array2[j].toString();
            if (item1 == item2){
                return true;
            }
        }                
    }    
    return false;
};

// find a match in array
exports.findMatchInArrays = function(array1, array2){
    
    var length1 = array1.length;
    var length2 = array2.length;
    
    for (var i = 0; i< length1; i++){
        
        for(var j=0; j<length2; j++){
            var item1 = array1[i].toString();
            var item2 = array2[j].toString();
            if (item1 == item2){
                return true;
            }
        }                
    }
    
    return false;
};

//check if array contains object
exports.checkArrayForObject = function(array){
    for(var i = 0; i < array.length; i++) {
        if (array[i].id > 0) {
            return true;
        }
    }
    return false;
};

// autoincrement id by one
exports.autoIncrementId = function(mongooseArray){
    var ids=[];
    for(var i=0; i<mongooseArray.length; i++){
           ids.push(mongooseArray[i].id);
       }
    var largest = Math.max.apply(Math, ids);
    
    // if no records, start at 0 and increment
    if (largest > -1){
            return largest + 1; 
    }else {
        return 1;
    }     
};

//create random token
exports.getToken = function(stringLength){
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var ranString = '';
    for (var i=0; i<stringLength; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        ranString += chars.substring(rnum,rnum+1);
    }
    return ranString;
};

// get random index of array
exports.getRandomArrayItem = function(array){
   
    var rand = Math.floor(Math.random()* array.length);
    return array[rand];
};

// get random value within range
var getRandomNumber = function(min, max){    
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.getRandomNumber = getRandomNumber;

// set characters attributes random, but must add on to max
exports.getRandAttributes = function(max, attributesNum){
    var values = [];
    var stamina = getRandomNumber(5,18);
    var maxStam = getRandomNumber(stamina+1,20); // max must be always higher than stamina
    values[0] = stamina;
    values[1] = maxStam;
    
    var currsum = stamina;
    for(i=2; i<attributesNum-1; i++) {
       values[i] = getRandomNumber(1, (max-currsum)/(attributesNum-i));
       currsum += values[i];
    }
    values[attributesNum-1] = max - currsum;
    return values;  
};






