const QRCode = require("qrcode-svg");

export const cardQrGenerator = (content) => {

  var qrcode = new QRCode({
    content: content,
    padding: 4,
    width: 500,
    height: 500,
    color: "#000000",
    background: "#ffffff",
    ecl: "L"
  });
  const tt = qrcode.svg({
    content: content,
    padding: 4,
    width: 500,
    height: 500,
    color: "#000000",
    background: "#ffffff",
    ecl: "L"
  });

  const head = '<?xml version="1.0" standalone="yes"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="500" height="500"><rect x="0" y="0" width="256" height="256" style="fill:#ffffff;shape-rendering:crispEdges;"/>';

  const foot = '</svg>';

  const main = head + tt + foot;
  const buffer = Buffer.from(main).toString('base64');

  return 'data:image/svg+xml;base64,' + buffer;
}