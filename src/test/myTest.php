<?php

echo "hello";
$a  = 1;
while ($a > 0) {
    while ($a > 0) {
        $a++;
        echo "2nd";
        echo $a;
        if ($a > 10) {
            break 3;
        }
    }
    echo "1st";
    echo $a;
}
echo " world"; 
?>