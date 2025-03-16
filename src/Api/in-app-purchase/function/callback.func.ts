export const InAppPurchaseCallbackFunction = (res, parsed, rsCode, traxid) => {
  const data = JSON.stringify({
    parsed
  });
  console.log(data, 'callback in app data json');

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(`
  <form action="${parsed?.ipgCallback}" method="post" id="pec_gateway">
    <input type="hidden" name="ref" value="${parsed?.payload?.basketShopId}" />
    <input type="hidden" name="data" value='${data}' />
    <input type="hidden" name="traxid" value='${traxid}' />
    <input type="hidden" name="rscode" value='${rsCode}' />

  </form>
  <script type="text/javascript">
  var f=document.getElementById('pec_gateway');
  f.submit();
  </script>
  `);
  res.end();
}