<?php
$a = 2;
function test() {
    static $a = 1;
}
test();
echo $a;
?>