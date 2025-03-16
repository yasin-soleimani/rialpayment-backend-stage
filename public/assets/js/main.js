
const token = document.getElementById("token").value;
const amount = document.getElementById("amount").value;

// Setup
var notification = new Notif({
  topPos: 10,
  classNames: 'success danger',
  autoClose: false,
  autoCloseTimeout: 3000
});



function Notif(option){
  var el = this;

  el.self = $('.toast-message');
  el.close = this.self.find('.close');
  el.message = el.self.find('.message');
  el.top = option.topPos;
  el.classNames = option.classNames;
  el.autoClose = (typeof option.autoClose === "boolean")? option.autoClose: false;
  el.autoCloseTimeout = (option.autoClose && typeof option.autoCloseTimeout === "number")? option.autoCloseTimeout: 3000;


  // Methods
  el.reset = function(){
    el.message.empty();
    el.self.removeClass(el.classNames);
  }
  el.show = function(msg,type){
    el.reset();
    el.self.css('top', el.top);
    el.message.text(msg);
    el.self.addClass(type);

    if(el.autoClose){
      setTimeout(function(){
        el.hide();
      }, el.autoCloseTimeout);
    }
  }
  el.hide = function(){
    el.self.css('top','-100%');
    el.reset();
  };

  el.close.on('click', this.hide);

}




/****************************
         VARIABALES
*****************************/
var socket = io('https://api.iccard.ir:61230',  { secure: true });


var qrType = 8;
var socketEvents = {
  connect: 'connect',
  disconnect: 'disconnect',
  safeChannel: 'safe',
  safeChannel2: 'payment'
};



/***** IPG QR OBJECT MODEL *****/
var qrCodeObject = {
  type: qrType,
  price: Number(amount),
  _id: token
}

$('#shetabcard').on('click', function clicked(e) {
  window.location = "https://service.iccard.ir/pay/" + token;
})

console.log( qrCodeObject)
/****************************
    SVG QR RENDER SECTION
*****************************/
window.addEventListener('load', () => {

  if (isMobileDevice()) {
    window.location = "https://service.iccard.ir/pay/" + token;
  }
  var qr = qrGenerator(JSON.stringify(qrCodeObject));

  const codeWriter = new ZXing.BrowserQRCodeSvgWriter();
  // you can get a SVG element.
  const svgElement = codeWriter.write(qr, 250, 250);
  // or render it directly to DOM.
  codeWriter.writeToDom('#result',qr , 250, 250);
});

  /* checks if user has fetched webApplication on Mobile/Tablet */
   function isMobileDevice() {
    const mobileRegex = /Mobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i;
    if (navigator.userAgent.match(mobileRegex)) {
      return true;
    } else {
      return false;
    }
  }

/****************************
    SOCKET HANDLING SECTION
*****************************/

// on connect event
socket.on(socketEvents.connect, function() {
  console.log('socket connected.');
  emitData(socketEvents.safeChannel, token);
});

// on channel
socket.on(socketEvents.safeChannel, function(data) {
  console.log( data , 'datax')
  const datax = JSON.parse( data );
  if ( datax.status == 201 ) {
    notification.show('برای پرداخت امن از موبایل استفاده کنید','success');
    emitData(socketEvents.safeChannel, 'ok');
  } else if ( datax.status == 200 ) {
    emitData(socketEvents.safeChannel, 'confirm');
    notification.show('پرداخت با موفقیت انجام شد','success');
    emitData(socketEvents.safeChannel, 'unsub');
    postform(datax.callbackurl, datax.terminalid, datax.amount, datax.invoiceid, datax.respcode, datax.respmsg, datax.payload,datax.ref, datax.cardnumber)
  } else {
    notification.show('برای پرداخت امن از موبایل استفاده کنید','success')
  }

});



// on disconnect event
socket.on(socketEvents.disconnect, function() {
  console.log('socket disconnected.')
});

/* emit data over a specific socket channel */
function emitData(channel, data) {
  socket.emit(channel, data);
}



/* this method generates a string which will be used for QR Generation
this one gets DATA as argument and after some transformation, returns an STRING */
function postform( callbackurl, terminalid,amount,invoiceid,respcode,respmsg,payload,ref,cardno) {

  var form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action", callbackurl);
  form.setAttribute("target", "_self");
  var terminalField = document.createElement("input");
  terminalField.setAttribute("name", "terminalid");
  terminalField.setAttribute("value", terminalid);
  form.appendChild(terminalField);
  var amountField = document.createElement("input");
  amountField.setAttribute("name", "amount");
  amountField.setAttribute("value", amount);
  form.appendChild(amountField);

  var invoiceField = document.createElement("input");
  invoiceField.setAttribute("name", "invoiceid");
  invoiceField.setAttribute("value", invoiceid);
  form.appendChild(invoiceField);

  var respcodeField = document.createElement("input");
  respcodeField.setAttribute("name", "respcode");
  respcodeField.setAttribute("value", respcode);
  form.appendChild(respcodeField);

  var respmsgField = document.createElement("input");
  respmsgField.setAttribute("name", "respmsg");
  respmsgField.setAttribute("value", respmsg);
  form.appendChild(respmsgField);

  var payloadField = document.createElement("input");
  payloadField.setAttribute("name", "payload");
  payloadField.setAttribute("value", payload);
  form.appendChild(payloadField);


  var digitalreceiptField = document.createElement("input");
  digitalreceiptField.setAttribute("name", "ref");
  digitalreceiptField.setAttribute("value",ref);
  form.appendChild(digitalreceiptField);

  var cardnumberField = document.createElement("input");
  cardnumberField.setAttribute("name", "cardnumber");
  cardnumberField.setAttribute("value", cardno);
  form.appendChild(cardnumberField);

  document.body.appendChild(form);

  form.submit();
  document.body.removeChild(form);
}

function qrGenerator(str) {
  var possible = 'ABCDEFGHIJKLMNOPQRTSUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var hexed = this.toHex(str);
  var baseUrl = 'http://iccard.ir/';
  var start = '';
  var end = '';

  for (var i = 0; i < 3; i++) {
    start += possible.charAt(Math.floor(Math.random() * possible.length));
    end += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return baseUrl + start + hexed + end;
}

/* this functions gets an argument as STRING (utf-8) and returns HEXADECIMAL type of it */
function toHex(data) {
  var hex = '';
  for (let i = 0; i < data.length; i++) {
    hex += '' + data.charCodeAt(i).toString(16);
  }
  return hex;
}

window.addEventListener("beforeunload", function(event) {

});


