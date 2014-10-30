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

// strip everything thats not a number
exports.sanitizeNumber = function (numb){
    console.log('number to sanitize: '+numb);
    if(numb !='undefined' && numb != null){
        return numb.replace(/[^0-9]/g, '');
    }else {
        console.log('number to sanitized is undefined');
    }
    
};

/********** calculations *******************/

// get index of assoc-array by key and value
exports.getIndexByKeyValue = function(array, key, value){
    console.log('key = '+key);
    console.log('value='+value);
    console.dir(array);
    for (var i = 0; i< array.length; i++){
        if (array[i][key] == value){
            return i;
        }        
    }
    return null;
}

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

// get random index of array
exports.getRandomArrayItem = function(array){
   
    var rand = Math.floor(Math.random()* array.length);
    return array[rand];
};

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
    
    console.log('attributesNum '+attributesNum+' max '+max);
    var currsum = stamina;
    for(i=2; i<attributesNum-1; i++) {
       values[i] = getRandomNumber(1, (max-currsum)/(attributesNum-i));
       currsum += values[i];
    }
    values[attributesNum-1] = max - currsum;
    return values;  
};




// get attribute-description depending on amount
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

