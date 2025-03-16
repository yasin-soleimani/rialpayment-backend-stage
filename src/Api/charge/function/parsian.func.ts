export function ChargeParsianFunction(token) {
  let redirectUrl = `https://pec.shaparak.ir/NewIPG/?Token=` + token;

  return `<form action="${redirectUrl}" method="post" id="pec_gateway"></form>
  <script type="text/javascript">
  var f=document.getElementById('pec_gateway');
  f.submit();
  </script>`;
}
