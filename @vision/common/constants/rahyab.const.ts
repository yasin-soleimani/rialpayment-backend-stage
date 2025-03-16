export const Rahyab = {
  username : 'web_iraniancreditcard',
  password: '671qnx22',
  company: 'IRANIANCREDITCARD',
  host: '193.104.22.14',
  port: '2055',
  url: '/CPSMSService/Access',
};

export const format = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n" +
  "<!DOCTYPE smsBatch PUBLIC \"-//PERVASIVE//DTD CPAS 1.0//EN\" \"http://www.ubicomp.ir/dtd/Cpas.dtd\">\r\n" +
  "<smsBatch company=\"IRANIANCREDITCARD\" batchID=\"!!batchid\">\r\n" +
  "<sms msgClass=\"1\" binary=\"true\" dcs=\"8\">\r\n" +
  "<destAddr><![CDATA[!!mobile]]></destAddr>\r\n" +
  "<origAddr><![CDATA[!!sender]]></origAddr>\r\n" +
  '<message><![CDATA[!!message]]></message>\r\n' +
  "</sms>\r\n" +
  "</smsBatch>";
