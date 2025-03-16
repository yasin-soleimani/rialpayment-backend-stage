export function ChargePnaFunction(data) {
  /*return `        <form action="https://pna.shaparak.ir/_ipgw_/payment/" method="post" id="pna_gateway">
  <input type="hidden" name="token" value="${data.token}" />
  <input type="hidden"  name="language" value="fa"/>
</form>
<script type="text/javascript">
var f=document.getElementById('pna_gateway');
f.submit();
</script>`;*/
  return `<form action="https://pna.shaparak.ir/mhui/home/index/${data.token}" method="get" id="pna_gateway">
        
        </form>
        <script type="text/javascript">
        var f=document.getElementById('pna_gateway');
        f.submit();
        </script>`;
}
