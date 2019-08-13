<?php
class MyClass
{
    public $public = 7;
    protected $protected = 10;
    private $private = 120;

    function printHello()
    {
        echo $this->public;
        echo $this->protected;
        echo $this->private;
    }
}

// $obj = new MyClass();
// echo $obj->public; // Works
// echo $obj->protected; // Fatal Error
// echo $obj->private; // Fatal Error
// $obj->printHello(); // Shows Public, Protected and Private


/**
 * Define MyClass2
 */
class MyClass2 extends MyClass
{
    // We can redeclare the public and protected properties, but not private
    public $public = 666;
    private $public = 777;
    // protected $protected = 'Protected2';
    function calculate() {
        $this->public += 1;
        $this->protected += 2;
        $this->private += 3; 
    }

    function printHello()
    {
        echo $this->public;
        echo "-------\n";
        echo $this->protected;
        echo "-------\n";
        echo $this->private;
        echo "-----------------------\n";
    }
}

$obj2 = new MyClass2();
$obj3 = new MyClass2();
// echo $obj2->public; // Works
// echo $obj2->protected; // Fatal Error
// echo $obj2->private; // Undefined
$obj2->printHello(); // Shows Public2, Protected2, Undefined
$obj3->calculate();
$obj3->printHello(); // Shows Public2, Protected2, Undefined
$obj2->printHello(); // Shows Public2, Protected2, Undefined
?>