<?php

namespace MyProject {

    $CONNECT_OK = 10;

    function aa() {
        global $CONNECT_OK;
        $CONNECT_OK  += 11;
    }
    aa();
    class Connection
    { public static function start (){
        global $CONNECT_OK;
        return $CONNECT_OK;
    } }
    function connect()
    {
        return; }
}

namespace { // global code
    session_start();
    $a = MyProject\connect();
    echo MyProject\Connection::start();
    echo MyProject\Connection::start();
    echo MyProject\Connection::start();
}
?>
