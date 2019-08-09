<?php
$a = array(1);
$b = &$a;
function f($x)
{
    global $a;
    global $b;
    echo ($a[0] + $b[0] + $x);
}
f(2);
$a[0] = $a[0] + 1;
f(2);

$c = 1;
$d = $c;
$d = 2;
echo $c;
?>