export function ChargeSamanFunction(data) {
  return `
  <form action="https://sep.shaparak.ir/payment.aspx" method="post" id="saman_gateway">
  <input type="hidden" name="Amount" value="${data.amount}" />
  <input type="hidden" name="ResNum" value="${data.invoiceid}" />
  <input type="hidden" name="MID" value="${data.terminalinfo.mid}" />
  <input type="hidden" name="RedirectURL" value="${data.callbackurl}" />

  </form>
  <script type="text/javascript">
  var f=document.getElementById('saman_gateway');
  f.submit();
  </script>
  `;
}
