export function ChargeBehpardakhtFunction(data) {
  return `
  <form action="https://bpm.shaparak.ir/pgwchannel/startpay.mellat" method="post" id="mellat_gateway">
  <input type="hidden" name="RefId" value="${data.token}" />
  </form>
  <script type="text/javascript">
  var f=document.getElementById('mellat_gateway');
  f.submit();
  </script>
  `;
}
