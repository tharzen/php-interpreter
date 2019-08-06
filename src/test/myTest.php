<?php

function &get_instance_ref()
{
    static $obj;

    echo 'Static object: ';
    var_dump($obj);
    if (!isset($obj)) {
        // 将一个引用赋值给静态变量
        $obj = &new stdclass;
    }
    $obj->property++;
    return $obj;
}

function &get_instance_noref()
{
    static $obj;

    echo 'Static object: ';
    var_dump($obj);
    if (!isset($obj)) {
        // 将一个对象赋值给静态变量
        $obj = new stdclass;
    }
    $obj->property++;
    return $obj;
}

$obj1 = get_instance_ref();
$still_obj1 = get_instance_ref();
echo "\n";
$obj2 = get_instance_noref();
$still_obj2 = get_instance_noref();