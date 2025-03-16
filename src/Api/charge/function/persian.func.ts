export function ChargePersianFunction(token) {
  return `
  <form action="https://asan.shaparak.ir" method="post" id="pec_gateway">
    <input type="hidden" name="RefId" value="${token}" />
  </form>
  <script type="text/javascript">
  var f=document.getElementById('pec_gateway');
  f.submit();
  </script>
`;
}
