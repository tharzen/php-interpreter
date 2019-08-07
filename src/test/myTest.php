<?php
global $a;
$a = 1;
function aa()
{
    $a += 10;
    echo $a;
}
aa();
echo $a;
?>