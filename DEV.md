# Development

## Dependency

Actually this project only depends on [glayzzle/php-parser](https://github.com/glayzzle/php-parser/) and typescript. Other dependencies are all for development.

## Usage

Please clone this repository using `git clone https://github.com/tharzen/php-interpreter.git`. And then run `git submodule init` and `git submodule update` for the php-parser submodule.

Please install `ts-node` for directly running typescript files. The install command is `npm install -g ts-node`.

And then in the root directory, run `ts-node src/main.ts`. It will run the `main.ts` which is the entry file for the php-interpreter right now.

## Test

Use [Jest](https://jestjs.io/en/) testing framework.

In the root directory, run `npm test`. This command will run all testcases in `src/main.spec.ts`.

For instance:
```
➜ npm test

> php-interpreter@1.0.0 test ~/php-interpreter
> jest

 PASS  src/main.spec.ts
  ✓ $a = 1; (17ms)
  ✓ $b = true; (3ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.212s
Ran all test suites.
```

## Bundle

Use [Webpack](https://webpack.js.org/) module bundler.

In the root directory, run `npx webpack`. This command will create a `bundle.js` as an output file in `dist` directory. Currently the entry file of webpack is `src/main.ts`.

For instance:
```
➜ npx webpack
Hash: 8a1b33a904e4563751be
Version: webpack 4.40.0
Time: 2445ms
Built at: 09/12/2019 9:47:25 PM
    Asset     Size  Chunks             Chunk Names
bundle.js  169 KiB       0  [emitted]  main
Entrypoint main = bundle.js
 [2] ./src/interpreter/evaluator/evaluator.ts 20.2 KiB {0} [built]
[16] ./src/main.ts 501 bytes {0} [built]
[20] ./src/interpreter/interpreter.ts 2.29 KiB {0} [built]
[21] ./src/interpreter/evaluator/environment.ts 3.21 KiB {0} [built]
[22] ./src/interpreter/evaluator/evaluation/array.ts 5.78 KiB {0} [built]
[23] ./src/interpreter/evaluator/evaluation/assign.ts 8.91 KiB {0} [built]
[24] ./src/interpreter/evaluator/evaluation/bin.ts 255 bytes {0} [built]
[25] ./src/interpreter/evaluator/evaluation/class.ts 2.5 KiB {0} [built]
[26] ./src/interpreter/evaluator/evaluation/closure.ts 2.63 KiB {0} [built]
[27] ./src/interpreter/evaluator/evaluation/const.ts 2.85 KiB {0} [built]
[28] ./src/interpreter/evaluator/evaluation/function.ts 2.65 KiB {0} [built]
[29] ./src/interpreter/evaluator/evaluation/global.ts 2.28 KiB {0} [built]
[30] ./src/interpreter/evaluator/evaluation/if.ts 386 bytes {0} [built]
[31] ./src/interpreter/evaluator/evaluation/include.ts 1.38 KiB {0} [built]
[41] ./src/interpreter/php-parser/src/index.js 5.29 KiB {0} [built]
    + 148 hidden modules
```

Then the `bundle.js` can be run in NodeJS or browser.

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
```php
// store a constant into memory
const A = 1;
```