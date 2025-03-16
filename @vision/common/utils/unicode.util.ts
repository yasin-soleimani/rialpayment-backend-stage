export function uniCode (message){
  var result = "";
  for(var i = 0; i < message.length; i++){
    var partial = message[i].charCodeAt(0).toString(16);
    while(partial.length !== 4) partial = "0" + partial;
    result +=  partial;
  }
  return result;
};