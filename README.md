# php-interpreter
A PHP interpreter written by TypeScript based on [php-parser v3.0.0-prerelease.8](https://github.com/glayzzle/php-parser/releases/tag/3.0.0-prerelease.8).

---

## Description
This interpreter accepts PHP source code and return results after running it.
```typescript
const php = `
<?php
    $a = 1;
?>`;
const interpreter = new Interpreter(php);
interpreter.run();
```

The front end of it is [php-parser](https://github.com/glayzzle/php-parser).

The back end of it is to evaluate the abstract syntax tree directly.

The evaluator uses execution stack to execute every expression and manipulates the variables in environment.

Currently there is no intermediate tier part.

### Language Specification
The PHP language specification [php-langspec](https://github.com/php/php-langspec/blob/master/spec).

### Memory Model 
The implementation of variable system is based on abstract model defined in [PHP langspec - memory model](https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#the-memory-model).

Traditionally, an environment is linked with its outer or enclosed environment thus it could be a linked list. And environments in this interpreter is contained by a Map. After the program exit one environment, we may destroy it or store it since the program may access some environments or some variables in them again such as `namespace`, `anonymous function`, `static`.

Each environment has one "bind" which contains 3 connected maps: vslot, vstore, hstore which represents a whole variable model in this environment.


### Development
- variable
   - array (ordered map)
- assignment
- loop
- conditional
- function
- class

## Built With
- [php-parser v3.0.0-prerelease.8](https://github.com/glayzzle/php-parser).
- [TypeScript](https://www.typescriptlang.org/index.html)

## Contributing
[Harry](https://github.com/eou)

## License
[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
