
<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <?php
    header('Content-type: text/plain; charset=utf-8');

    echo $_POST['terminalid']. "<br />";
    echo $_POST['amount']. "<br />";
    echo $_POST['invoiceid']. "<br />";
    echo $_POST['respcode']. "<br />";
    echo $_POST['respmsg']. "<br />";
    echo $_POST['ref']. "<br />";
    echo $_POST['cardnumber']. "<br />";
    echo $_POST['issuerbank']. "<br />";
    echo "<br />";
    echo( file_get_contents('php://input'));

?>

</body>
</html>