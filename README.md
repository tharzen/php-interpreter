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
The evaluator use execution stack to execute each expression and modify the variables in environment.

### Language Specification
The PHP language specification [php-langspec](https://github.com/php/php-langspec/blob/master/spec).

### Memory Model 
The implementation of variable system is based on abstract model defined in [PHP langspec - memory model](https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#the-memory-model).


### Development
1. variable
   1. array (ordered map)
2. assignment
3. loop
4. conditional
5. function
6. class

## Built With
- [php-parser v3.0.0-prerelease.8](https://github.com/glayzzle/php-parser).
- [TypeScript](https://www.typescriptlang.org/index.html)

## Contributing
[Harry](https://github.com/eou)

## License
[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
