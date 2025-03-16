<?php
		$params ='terminalid=2000041&amount=1000&payload=&callbackurl=https://iccard.ir/callback.php&invoiceid=2025465465';
        $ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://service.iccard.ir');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$res2 = curl_exec($ch);
		curl_close($ch);
        $result = json_decode($res2,true);
        if ($result['status']) {
            header('location: https://service.iccard.ir/pay/'. $result['invoiceid']);
        }else{
            echo "متاسفانه مشکلی به وجود آمده است";
        }
?>


<?php
		$params ='terminalid=2000041&amount=1000&payload=&callbackurl=https://iccard.ir/callx12.php&invoiceid=2025465465';
        $ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://service.iccard.ir');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$res2 = curl_exec($ch);
		curl_close($ch);
        $result = json_decode($res2,true);
        if ($result['status']) {
        ?>
        `<form action="https://service.iccard.ir/newIPG" method="post" id="pec_gateway">
            <input type="hidden" name="ref" value="<?php echo $result['invoiceid'] ?>" />
        </form>
        <script type="text/javascript">
        var f=document.getElementById('pec_gateway');
        f.submit();
        </script>
        <?php
        }else{
            echo "متاسفانه مشکلی به وجود آمده است";
        }
?>