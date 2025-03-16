import { nowPersian } from "@vision/common/utils/month-diff.util";

var fs = require('fs')
var path = require('path')
var Canvas = require('canvas')
var QRCode = require("qrcode-svg");

export async function makeTicketImage( content, mobile, amount, ref, serial ) {
console.log( mobile , 'mobile')
Canvas.registerFont('./@vision/common/utils/fonts/myfont.ttf', { family: 'Iransans' });

var canvas = Canvas.createCanvas(539, 1080)
var ctx = canvas.getContext('2d')

ctx.fillStyle = '#FFF'
ctx.fillRect(0, 0, 539, 1080)

ctx.strokeRect(10, 10, 519, 1060 )

const eram = await Canvas.loadImage('./@vision/common/utils/images/eram_logo.png');
ctx.drawImage(eram, 160, 20, 70, 70);

const iranian = await Canvas.loadImage('./@vision/common/utils/images/icc_logo_120.png');
ctx.drawImage(iranian, 280, 20, 70, 70);

var qrcode = new QRCode({
  content: content,
  padding: 4,
  width: 500,
  height: 500,
  color: "#000000",
  background: "#ffffff",
  ecl: "L"
});
const tt =qrcode.svg({
  content: content,
  padding: 4,
  width: 500,
  height: 500,
  color: "#000000",
  background: "#ffffff",
  ecl: "L"
});

const head= '<?xml version="1.0" standalone="yes"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="500" height="500"><rect x="0" y="0" width="256" height="256" style="fill:#ffffff;shape-rendering:crispEdges;"/>';

const foot = '</svg>';

const main = head + tt + foot;
const buffer = Buffer.from(main).toString('base64');

const mainQr = 'data:image/svg+xml;base64,' + buffer;

const qr = await Canvas.loadImage(mainQr);

ctx.drawImage(qr, 20, 120, 500, 500);

ctx.fillStyle = '#000'
ctx.font = '19px Iransans'
ctx.fillText('پشتیبانی   :    ۷۵۱۸۱۰۰۰-۰۲۱', 155, 120)

ctx.fillStyle = '#000'
ctx.font = '25px Iransans';
ctx.fillText('بلیط باغ وحش' , 200, 630)
ctx.font = '19px Iransans';

ctx.fillRect(18, 670, 502, 2)
ctx.fillText( amount + 'ریال ', 40, 700)
ctx.fillText('مبلغ :‌' , 460, 700)

ctx.fillText( mobile, 40, 730)
ctx.fillText('موبایل :‌' , 443, 730)

ctx.fillText( serial , 40, 760)
ctx.fillText('شماره سریال :‌' , 400, 760)

ctx.fillText( nowPersian() , 40, 790)
ctx.fillText('تاریخ :‌' , 450, 790)

ctx.fillText(ref, 40, 820)
ctx.fillText('کد پیگیری :‌' , 413, 820)

ctx.fillStyle = '#000'
ctx.fillRect(18, 850, 502, 2)


const tree = await Canvas.loadImage('./@vision/common/utils/images/ic_tree.png');
ctx.drawImage(tree, 255, 860, 40, 40);

ctx.fillText('من دوست دار طبیعتم', 190, 930)
ctx.fillText('خلق نشاط و شادی در دنیای ارم', 150, 960)
ctx.fillText('پرداخت ، ابطال و انصراف از خرید از طریق', 115, 990)
ctx.fillText('اپلیکیشن ریال پیمنت', 150, 1020)
ctx.fillText(' ۱۰۰۰۷۵۱۸۱۰۰۰ ارسال عدد ۱ به ', 150, 1050)

ctx.drawImage(iranian, 240, 350, 70, 70);

const filename= mobile + "_" + new Date().getTime() + '.png';
canvas.createPNGStream().pipe(fs.createWriteStream(path.join(process.env.UPLOAD_URI , filename)));
return filename;
}



