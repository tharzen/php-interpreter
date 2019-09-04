# Development

## Language Constructs

- variable
  - scalar type `$` ✔
  - global `global` ✔
  - array `Array()` `[]` ✔
  - object
- expression
  - subscript `[]`
    - array ✔
    - string ✔
    - object
  - assignment
    - variable =
    - list-intrinsic =
    - compound-assignment-expression
    - coalesce-expression
    - `? :`
  - call function
  - new object
- loop
- conditional
- function declaration ✔
- class declaration
  - method declaration ✔
- closure ✔

## Testcases

Try to change the PHP input in `src/main.ts` and then run `ts-node main.ts`. The evaluator will be printed for test.

All passed testcases:
```php
// store $a into memory, $a = 1 (integer)
$a = 1;
// store $b into memory, $b = true (boolean)
$b = true;
// store $c into memory, $c = false (boolean)
$c = false;
// store $d into memory, $d = "str" (string)
$d = "str";
```
```php
// store $a and $b into memory, $a = 1, $b = 1
$a = $b = 1;
```
```php
// store $a into memory, $a = null, $b is undefined
$a = $b;
```
```php
// store array $a into memory, $a is a map: (0 => 1, 1 => 4)
$a = [1, 4];
// add new element 99 into array $a, $a is a map: (0 => 1, 1 => 4, 1000 => 99)
$a["1000"] = 99;
// add new element "str" into array $a, $a is a map: (0 => 1, 1 => 4, 1000 => 99, 1001 => "str")
$a[] = "str";

// store array $b into memory, $b is a map: (0 => true (boolean), 1 => "str" (string))
$b = Array(true, "str");
// store array $c into memory, $c is a map: (100 => 1.2, 101 => 4);
$c = [100 => 1.2, 4];
```
```php
// store a string into memory, $a = "123"
$a = "123";
// add new character into string, $a = "123       a", use white space filling the length
$a[10] = "a";
// store $b into memory, $b = "2"
$b = $a[1];
```
```php
// store a function declaration object into memory
function f($a, $b) {
    $a = 1;
    $b = 2;
}
```