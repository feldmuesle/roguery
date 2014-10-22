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
    console.log('string to sanitize '+string);
    if(typeof stringValue && string){
        console.log('string sanitized '+string);
        return string.replace(/[&<>${}\[\]/]/g,'');
    }    
};

/********** calculations *******************/

// get random value within range
var getRandomNumber = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;

};

// set characters attributes random, but must add on to max
exports.getRandAttributes = function(max, attributesNum){
    var values = [];
    var stamina = getRandomNumber(5,18);
    var maxStam = getRandomNumber(stamina+1,20); // max must be always higher than stamina
    values[0] = stamina;
    values[1] = maxStam;
    
    var currsum = 0;
    for(i=2; i<attributesNum-1; i++) {
       values[i] = getRandomNumber(1, max/(attributesNum -4));//-(attributesNum-i)-currsum);
       currsum += values[i];
    }
    values[attributesNum-1] = max - currsum;
    return values;  
};

var getAttributDesc = function(attribute, value){
  switch(true){
        case(value < 5):
            switch(attribute){
                
            }
            break;

        case(9 > value >=5):
            break;
            
        case(14 > value <=9):
            break;
            
        case(20 > value <=14):
            break;    
            
        case(25 > value <=20):
            break;  
        
        case(value >=25):
            break;    
  }  
};

