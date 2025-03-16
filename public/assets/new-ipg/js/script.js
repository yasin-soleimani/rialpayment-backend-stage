
var rfControl = document.getElementById('rf');
var tokenControl = document.getElementById('token');
var id = document.getElementById('xidz').value;


var countDownDateX = new Date();
var countDownDate2 = countDownDateX.setTime(
    countDownDateX.getTime() + (10 * 60000) - 10000
);
var countDownDate = new Date(countDownDate2);
var interval = setInterval(function () {

    var now = new Date().getTime();
    var distance = countDownDate - now;
    if (distance < 0) {
        cnclTrax()
        clearInterval(interval);
    }
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // seconds === 00 && minutes === 00 & window.location.reload()
    document.getElementById("min").innerHTML = minutes;
    document.getElementById("sec").innerHTML = seconds;
}, 1000);


// srcitp me

var cardNumber1 = null;
var cardNumber2 = null;
var cardNumber3 = null;
var cardNumber4 = null;
var cvv2 = null;
var expireDate = null;
var code = null;
var secondPassword = null;
var email = null;
var saveCard = null;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function getFormData(event) {
    event.preventDefault();

    this.cardNumber1 = event.target.card_number1.value;
    this.cardNumber2 = event.target.card_number2.value;
    this.cardNumber3 = event.target.card_number3.value;
    this.cardNumber4 = event.target.card_number4.value;
    this.cvv2 = event.target.cvv2.value;
    this.expireDate =
        event.target.expireDateTwo.value + "/" + event.target.expireDateOne.value;
    this.code = event.target.code.value;
    this.secondPassword = event.target.secondPassword.value;
    this.email = event.target.email.value;
    this.saveCard = event.target.saveCard.checked;

    if (!checkInputs()) {
        document.getElementById("submit").disabled = true
        document.getElementById("cancel").disabled = true
        document.getElementById("msubmit").disabled = true
        document.getElementById("mcancel").disabled = true

        var cardnumber = cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4;
        var rf = rfControl.value;
        var token = tokenControl.value;

        var params = 'cardno=' + cardnumber + '&pin=' + secondPassword + '&cvv2=' + cvv2 + '&expire=' + expireDate + '&token=' + token + '&rf=' + rf + '&id=' + id + '&captcha=' + code;
        var url = 'https://service.rialpayment.ir/internetpaymentgateway/payment';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            // do something to response
            const pars = JSON.parse(this.responseText);
            if (pars.success === true) {
                var elem = document.getElementById("notif");
                if (elem != null) elem.parentNode.removeChild(elem);

                document.querySelectorAll('.notif-content').forEach(function (button) {
                    button.innerHTML =
                        `<div class="alert alert-2-success">
      <h3 class="alert-title">${pars.message}</h3>
    </div>`;
                })

                //document.getElementById('msg').appendChild(div);
                window.location = "https://service.rialpayment.ir/internetpaymentgateway/result/?token=" + token;

            } else {
                var elem = document.getElementById("notif");
                if (elem != null) elem.parentNode.removeChild(elem);


                document.querySelectorAll('.notif-content').forEach(function (button) {
                    button.innerHTML = `
 <div id="notif" class="alert alert-3-danger">
      <h3 class="alert-title">${pars.message}</h3>
    </div>`
                });

                // document.getElementById('msg').appendChild(div);
                let intr = setTimeout(function () {
                    var elem = document.getElementById("notif");
                    if (elem != null) elem.parentNode.removeChild(elem);
                    clearTimeout(intr)
                }, 5000);
                document.getElementById("submit").disabled = false;
                document.getElementById("cancel").disabled = false;
            }
        };
        xhr.send(params);
    }
}

function updateCardNumber() {
    var element = document.getElementById("cardNumber");
    element.value = element.value
        .replace(/[^\dA-Z]/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
}


function updateCardNumber() {
    var element = document.getElementById("mobileCardNumber");
    element.value = element.value
        .replace(/[^\dA-Z]/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
}

var modal = document.getElementById('myModal');
var modal2 = document.getElementById('myModal2');


// Get the button that opens the modal
var btn = document.getElementById("myBtn");
var btn2 = document.getElementById("myBtn2");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
    sendPin()
}
btn2.onclick = function () {
    sendPin()
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


function clearInputs() {
    document.getElementById('cart_number2').value = "";
    document.getElementById('cart_number3').value = "";
    document.getElementById('cart_number4').value = "";
    document.getElementById('cvv2').value = "";
    document.getElementById('expireMonth').value = "";
    document.getElementById('expireYear').value = "";
    document.getElementById('securityCode').value = "";
    document.getElementById('secondPassword').value = "";
    document.getElementById('email_input').value = "";
    cnclTrax()
}


function checkInputs() {
    var cart_number2 = document.getElementById('cart_number2');
    var cart_number3 = document.getElementById('cart_number3');
    var cart_number4 = document.getElementById('cart_number4');

    let error = false;
    if (cart_number2.value.length < 4 || cart_number3.value.length < 4 || cart_number4.value.length < 4) {
        document.getElementById("cart_validation").style.display = "block";
        error = true
    } else if (cart_number2.value.length == 4 && cart_number3.value.length == 4 && cart_number4.value.length == 4) {
        document.getElementById("cart_validation").style.display = "none";
    }

    var cvv2 = document.getElementById('cvv2');
    if (cvv2.value.length < 4) {
        document.getElementById("cvv2_validation").style.display = "block";
        error = true
    } else if (cvv2.value.length == 4) {
        document.getElementById("cvv2_validation").style.display = "none";
    }

    var expireMonth = document.getElementById('expireMonth');
    var expireYear = document.getElementById('expireYear');

    if (expireMonth.value.length < 2 || expireYear.value.length < 2) {
        document.getElementById("cart_expire_date").style.display = "block";
        error = true
    } else if (expireMonth.value.length == 2 || expireYear.value.length == 2) {
        document.getElementById("cart_expire_date").style.display = "none";
    }

    var securityCode = document.getElementById('securityCode');
    if (securityCode.value.length == 0) {
        document.getElementById("security_code_validation").style.display = "block";
        error = true
    } else if (securityCode.value.length != 0) {
        document.getElementById("security_code_validation").style.display = "none";
    }

    var secondPassword = document.getElementById('secondPassword');
    if (secondPassword.value.length <= 3) {
        document.getElementById("second_code_validation").style.display = "block";
        error = true
    } else if (secondPassword.value.length > 3) {
        document.getElementById("second_code_validation").style.display = "none";
    }
    var securityCode = document.getElementById('securityCode');
    var input = document.getElementById('email_input')

    return error
}

function sendPin(form){
    const c1 = document.getElementById('cart_number1').value;
    const c2 = document.getElementById('cart_number2').value;
    const c3 = document.getElementById('cart_number3').value;
    const c4 = document.getElementById('cart_number4').value;

    var cardnumber = c1 + c2 + c3 + c4;

    var params = 'cardno=' + cardnumber
    var url = 'https://api.rialpayment.ir:8080/v1/card/management/otp-sms';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        // do something to response
        const pars = JSON.parse(this.responseText);
        if (pars.success === true) {
            modal.style.display = "block";
        }else alert("خطا در ارسال رمز ");
    }
    xhr.send(params);
}

function checkMobileInputs() {
    var mobile_cart_number2 = document.getElementById('mobile_cart_number2');
    var mobile_cart_number3 = document.getElementById('mobile_cart_number3');
    var mobile_cart_number3 = document.getElementById('mobile_cart_number4');

    let error = false;
    if (mobile_cart_number2.value.length < 4 || mobile_cart_number3.value.length < 4 || mobile_cart_number3.value.length < 4) {
        document.getElementById("mobile_cart_validation").style.display = "block";
        error = true;
    } else if (mobile_cart_number2.value.length == 4 && mobile_cart_number3.value.length == 4 && mobile_cart_number3.value.length == 4) {
        document.getElementById("mobile_cart_validation").style.display = "none";
    }

    var cvv2 = document.getElementById('mobile_cvv2');
    if (cvv2.value.length < 4) {
        document.getElementById("mobile_cvv2_validation").style.display = "block";
        error = true;
    } else if (cvv2.value.length == 4) {
        document.getElementById("mobile_cvv2_validation").style.display = "none";
    }
    var expireMonth = document.getElementById('mobile_month');
    var expireYear = document.getElementById('mobile_year');

    if (expireMonth.value.length < 2 || expireYear.value.length < 2) {
        document.getElementById("mobile_date_validation").style.display = "block";
        error = true;
    } else if (expireMonth.value.length == 2 && expireYear.value.length == 2) {
        document.getElementById("mobile_date_validation").style.display = "none";
    }

    var secondPassword = document.getElementById('mobile_second_pass');

    if (secondPassword.value.length < 5) {
        document.getElementById("mobile_second_pass_validation").style.display = "block";
        error = true;

    } else if (secondPassword.value.length >= 5) {
        document.getElementById("mobile_second_pass_validation").style.display = "none";
    }


    var mobile_security_code = document.getElementById('mobile_security_code');

    if (mobile_security_code.value.length < 4) {
        document.getElementById("mobile_security_code_validation").style.display = "block";
        error = true;
    } else if (mobile_security_code.value.length >= 4) {
        document.getElementById("mobile_security_code_validation").style.display = "none";
    }

    var mobile_email_input = document.getElementById('mobile_email_input');


    var form = document.getElementById("mobileForm");

   return error

}


function checkmail() {

    var input = document.getElementById('email_input').value;

    if (input.trim() != "") {

        if (input.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            document.getElementById("email_validation_msg").style.display = "none";
            Emailaddress = input;
            var mobile_email_input = document.getElementById('mobile_email_input');
            mobile_email_input.value = Emailaddress;
        } else {
            document.getElementById("email_validation_msg").style.display = "block";
        }
    } else if (input.trim() == "") {
        document.getElementById("email_validation_msg").style.display = "none";
    }
}


function mobileCheckmail() {
    var input = document.getElementById('mobile_email_input').value;

    if (input.trim() != "") {
        if (input.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            document.getElementById("mobile_email_validation").style.display = "none";
            Emailaddress = input;
            var email_input = document.getElementById('email_input');
            email_input.value = Emailaddress;
        } else {
            document.getElementById("mobile_email_validation").style.display = "block";
        }
    } else if (input.trim() == "") {
        document.getElementById("mobile_email_validation").style.display = "none";
    }
}

function checkMailFinal(input) {
    if (input.trim() != "") {
        if (input.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return true;
        } else {
            alert("err ema");
            return false;
        }
    }
}


var cart_number = "";
var cvv2 = "";
var month = "";
var year = "";
var securityCode = "";
var Emailaddress = "";
var ischeked = "";


function SetCardNum(event) {
    var parent_details_cart_num = document.getElementById('parent-details-cart-num');
    var cart_number1 = document.getElementById('cart_number1');
    var cart_number2 = document.getElementById('cart_number2');
    var cart_number3 = document.getElementById('cart_number3');
    var cart_number4 = document.getElementById('cart_number4');

    var mobile_cart_number2 = document.getElementById('mobile_cart_number2');
    var mobile_cart_number3 = document.getElementById('mobile_cart_number3');
    var mobile_cart_number4 = document.getElementById('mobile_cart_number4');

    var mobile_panel_cart_num = document.getElementById('mobile_panel_cart_num');

    mobile_cart_number2.value = cart_number2.value;
    mobile_cart_number3.value = cart_number3.value;
    mobile_cart_number4.value = cart_number4.value;
    cart_number = cart_number1.value + " " + cart_number2.value + " " + cart_number3.value + " " + cart_number4.value;
    mobile_panel_cart_num.innerHTML = cart_number;
    parent_details_cart_num.innerHTML = cart_number;

}

const card2 = document.getElementById('cart_number2')
const card3 = document.getElementById('cart_number3')
const card4 = document.getElementById('cart_number4')
card2.addEventListener("keyup", (e) => {
    SetCardNum(e)
});
card3.addEventListener("keyup", (e) => {
    SetCardNum(e)
});
card4.addEventListener("keyup", (e) => {
    SetCardNum(e)
});

const mcard2 = document.getElementById('mobile_cart_number2')
const mcard3 = document.getElementById('mobile_cart_number3')
const mcard4 = document.getElementById('mobile_cart_number4')
mcard2.addEventListener("keyup", (e) => {
    mobileSetCardNum(e)
});
mcard3.addEventListener("keyup", (e) => {
    mobileSetCardNum(e)
});
mcard4.addEventListener("keyup", (e) => {
    mobileSetCardNum(e)
});

function mobileSetCardNum() {
    var mobile_panel_cart_num = document.getElementById('mobile_panel_cart_num');
    var mobile_cart_number1 = document.getElementById('mobile_cart_number1');
    var mobile_cart_number2 = document.getElementById('mobile_cart_number2');
    var cart_number2 = document.getElementById('cart_number2');
    var mobile_cart_number3 = document.getElementById('mobile_cart_number3');
    var cart_number3 = document.getElementById('cart_number3');
    var mobile_cart_number4 = document.getElementById('mobile_cart_number4');
    var cart_number4 = document.getElementById('cart_number4');

    cart_number = mobile_cart_number1.value + " " + mobile_cart_number2.value + " " + mobile_cart_number3.value + " " + mobile_cart_number4.value;

    var mobile_panel_cart_num = document.getElementById('mobile_panel_cart_num');
    var parent_details_cart_num = document.getElementById('parent-details-cart-num');

    mobile_panel_cart_num.innerHTML = cart_number;
    parent_details_cart_num.innerHTML = cart_number;

    cart_number2.value = mobile_cart_number2.value;
    cart_number3.value = mobile_cart_number3.value;
    cart_number4.value = mobile_cart_number4.value;
}


function removeSigns() {
    var input = document.getElementById('cvv2');
    var valueToChange = input.value;
    valueToChange = valueToChange.replace(/[^0-9a-zA-Z]+/g, '');
    input.innerHTML = valueToChange;
}

function sendcvv2() {
    var parent_cvv2 = document.getElementById('cvv2');
    var mobile_cvv2 = document.getElementById('mobile_cvv2');
    cvv2 = parent_cvv2.value;
    mobile_cvv2.value = cvv2;
}

function mobilesendcvv2() {
    var parent_cvv2 = document.getElementById('cvv2');
    var mobile_cvv2 = document.getElementById('mobile_cvv2');
    cvv2 = mobile_cvv2.value;
    parent_cvv2.value = cvv2;
}


function Validate(id, numType) {
    var thisId = document.getElementById(id);
    if (numType == "integer") {
        var remChars = thisId.value.replace(/[^0-9\.]/g, '');
        thisId.value = remChars.replace(/\./g, '');
    } else if (numType == "float") {
        thisId.value = thisId.value.replace(/[^0-9\.]/g, '');
    }
}


function SendYear() {
    var parentExpireYear = document.getElementById('expireYear');
    var mobile_year = document.getElementById('mobile_year');
    year = parentExpireYear.value;
    mobile_year.value = year;
}

function mobileSendYear() {
    var parentExpireYear = document.getElementById('expireYear');
    var mobile_year = document.getElementById('mobile_year');
    year = mobile_year.value;
    parentExpireYear.value = year;
}


function sendMonth() {
    var expireMonth = document.getElementById('expireMonth');
    var mobile_month = document.getElementById('mobile_month');
    month = expireMonth.value;
    mobile_month.value = month;
    var cart_expire_date = document.getElementById('cart_expire_date');
    if (month > 12) {
        document.getElementById("cart_expire_date").innerHTML = "عدد ماه در بازه ی مشخص شده وارد شود";
        document.getElementById("cart_expire_date").style.display = "block";
    } else if (month <= 12) {
        document.getElementById("cart_expire_date").style.display = "none";
        // document.getElementById("cart_expire_date").style.innerHTML = "block";
    }
}


function mobileSendMonth() {
    var expireMonth = document.getElementById('expireMonth');
    var mobile_month = document.getElementById('mobile_month');
    month = mobile_month.value;
    expireMonth.value = month;
}

function sendSecurityCode() {
    var securityCode = document.getElementById('securityCode');
    var mobile_security_code = document.getElementById('mobile_security_code');
    securityCode = securityCode.value;
    mobile_security_code.value = securityCode;
}

function mobileSendSecurityCode() {
    var securityCode = document.getElementById('securityCode');
    var mobile_security_code = document.getElementById('mobile_security_code');
    securityCode = mobile_security_code.value;
    securityCode.value = mobile_security_code;
}

function sendSecondPassword() {
    var secondPassword = document.getElementById('secondPassword');
    var mobile_second_pass = document.getElementById('mobile_second_pass');
    securityCode = secondPassword.value;
    mobile_second_pass.value = securityCode;
}

function mobileSendSecondPassword() {
    var secondPassword = document.getElementById('secondPassword');
    var mobile_second_pass = document.getElementById('mobile_second_pass');
    securityCode = mobile_second_pass.value;
    secondPassword.value = securityCode;
}


function autoTab(field1, len, field2) {
    if (document.getElementById(field1).value.length == len) {
        document.getElementById(field2).focus();
    }
}


function getMobileInputs(event) {
    this.cardNumber1 = event.target.mobile_card_number1.value;
    this.cardNumber2 = event.target.mobile_card_number2.value;
    this.cardNumber3 = event.target.mobile_card_number3.value;
    this.cardNumber4 = event.target.mobile_card_number4.value;
    this.cvv2 = event.target.mobile_cvv2.value;
    this.expireDate =
        event.target.mobile_year.value + "/" + event.target.mobile_month.value;
    this.code = event.target.mobile_security_code.value;
    this.secondPassword = event.target.mobile_second_pass.value;
    this.email = event.target.mobile_email_input.value;
    this.saveCard = event.target.mobileSaveCard.checked;

    if (!checkMobileInputs()) {
        document.getElementById("submit").disabled = true
        document.getElementById("cancel").disabled = true
        document.getElementById("msubmit").disabled = true
        document.getElementById("mcancel").disabled = true

        var cardnumber = cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4;
        var rf = rfControl.value;
        var token = tokenControl.value;

        var params = 'cardno=' + cardnumber + '&pin=' + secondPassword + '&cvv2=' + cvv2 + '&expire=' + expireDate + '&token=' + token + '&rf=' + rf + '&id=' + id + '&captcha=' + code;
        var url = 'https://service.rialpayment.ir/internetpaymentgateway/payment';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            // do something to response
            const pars = JSON.parse(this.responseText);
            if (pars.success === true) {
                var elem = document.getElementById("notif");
                if (elem != null) elem.parentNode.removeChild(elem);

                document.querySelectorAll('.notif-content').forEach(function (button) {
                    button.innerHTML =
                        `<div class="alert alert-2-success">
      <h3 class="alert-title">${pars.message}</h3>
    </div>`;
                })

                //document.getElementById('msg').appendChild(div);
                window.location = "https://service.rialpayment.ir/internetpaymentgateway/result/?token=" + token;

            } else {
                var elem = document.getElementById("notif");
                if (elem != null) elem.parentNode.removeChild(elem);


                document.querySelectorAll('.notif-content').forEach(function (button) {
                    button.innerHTML = `
 <div id="notif" class="alert alert-3-danger">
      <h3 class="alert-title">${pars.message}</h3>
    </div>`
                });

                // document.getElementById('msg').appendChild(div);
                let intr = setTimeout(function () {
                    var elem = document.getElementById("notif");
                    if (elem != null) elem.parentNode.removeChild(elem);
                    clearTimeout(intr)
                }, 5000);
                document.getElementById("submit").disabled = false;
                document.getElementById("cancel").disabled = false;
            }
        };
        xhr.send(params);
    }
}


function checkNumber(event) {
    var aCode = event.which ? event.which : event.keyCode;
    if (aCode > 31 && (aCode < 48 || aCode > 57)) return false;
    return true;
}

document.getElementById("refresh-captcha").addEventListener("click", e => {
})


var cart_number2 = document.getElementById("cart_number2"),
    cart_number3 = document.getElementById("cart_number3"),
    cart_number4 = document.getElementById("cart_number4");
cvv2 = document.getElementById("cvv2");
expireYear = document.getElementById("expireYear");
expireMonth = document.getElementById("expireMonth");
securityCode = document.getElementById("securityCode");
secondPassword = document.getElementById("secondPassword");
email_input = document.getElementById("email_input");

cart_number2.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        cart_number3.focus();
    }
}

cart_number3.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        cart_number4.focus();
    }
}
cart_number4.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        cvv2.focus();
    }
}
cvv2.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        expireMonth.focus();
    }
}
expireYear.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        securityCode.focus();
    }
}
expireMonth.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        expireYear.focus();
    }
}
securityCode.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        secondPassword.focus();
    }
}
secondPassword.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        email_input.focus();
    }
}


// auto tab mobile inputs


mobile_cart_number4 = document.getElementById("mobile_cart_number4");
mobile_cvv2 = document.getElementById("mobile_cvv2");
mobile_year = document.getElementById("mobile_year");
mobile_month = document.getElementById("mobile_month");
mobile_second_pass = document.getElementById("mobile_second_pass");
mobile_security_code = document.getElementById("mobile_security_code");

mobile_email_input = document.getElementById("mobile_email_input");


mobile_cart_number4.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        mobile_cvv2.focus();
    }
}
mobile_cvv2.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        mobile_year.focus();
    }
}
mobile_year.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        mobile_month.focus();
    }
}
mobile_month.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        mobile_security_code.focus();
    }
}
mobile_second_pass.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {
        mobile_email_input.focus();
    }
}
mobile_security_code.onkeyup = function () {
    if (this.value.length === parseInt(this.attributes["maxlength"].value)) {

        mobile_second_pass.focus();
    }
}

var container = document.getElementsByClassName("mobile-cart-info")[0];
container.onkeyup = function (e) {
    var target = e.srcElement;
    var maxLength = parseInt(target.attributes["maxlength"].value, 10);
    var myLength = target.value.length;
    if (myLength >= maxLength) {
        var next = target;
        while (next = next.nextElementSibling) {
            if (next == null)
                break;
            if (next.tagName.toLowerCase() == "input") {
                next.focus();
                break;
            }
        }
    }
}

function seperate() {
    var paymentValue = document.getElementById('paymentValue');
    var paymentValue2 = document.getElementById('paymentValue2');

    var number = paymentValue.innerText;
    var commas = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    paymentValue.innerHTML = commas;
    paymentValue2.innerHTML = commas;

}


function cnclTrax(form) {
    document.getElementById("submit").disabled = true;
    document.getElementById("cancel").disabled = true;
    document.getElementById("msubmit").disabled = true;
    document.getElementById("mcancel").disabled = true;

    var rf = rfControl.value;
    var token = tokenControl.value;

    var params = 'token=' + token + '&rf=' + rf;
    var url = 'https://service.rialpayment.ir/internetpaymentgateway/cancel';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        // do something to response
        const pars = JSON.parse(this.responseText);
        if (pars.success === true) {
            var elem = document.getElementById("notif");
            if (elem != null) elem.parentNode.removeChild(elem);

            var div = document.getElementsByClassName('notif-content')

            div.className = 'row';

            document.querySelectorAll('.notif-content').forEach(function (button) {
                button.innerHTML = `
 <div id="notif" class="alert alert-3-danger">
      <h3 class="alert-title">تراکنش لغو شد</h3>
    </div>`
            });

            window.location = "https://service.rialpayment.ir/internetpaymentgateway/result/?token=" + token;

        } else {
            var elem = document.getElementById("notif");
            if (elem != null) elem.parentNode.removeChild(elem);

            var div = document.getElementsByClassName('notif-content')

            div.className = 'row';

            document.querySelectorAll('.notif-content').forEach(function (button) {
                button.innerHTML = `
 <div id="notif" class="alert alert-3-danger">
      <h3 class="alert-title">${pars.message}</h3>
    </div>`
            });


            setTimeout(function () {
                var elem = document.getElementById("notif");
                if (elem != null) elem.parentNode.removeChild(elem);
            }, 5000);
            document.getElementById("submit").disabled = false;
            document.getElementById("cancel").disabled = false;

        }
    };
    xhr.send(params);
}
