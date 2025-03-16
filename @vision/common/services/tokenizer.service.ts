function  insertStr(str: string, index, value) {
   const uid = str.toString();
  const data = uid.substr(0, index) + value + uid.substr(index);
  return data;
}

export  function primeNumberToken(str){
str = insertStr(str, 2, '5')
str = insertStr(str, 3, 'x');
str = insertStr(str, 5, 'e');
str = insertStr(str, 7, '7');
str = insertStr(str, 11, 'i');
str = insertStr(str, 13, 's');
str = insertStr(str, 17, 'l');

return str;
}
