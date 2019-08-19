# Evaluator

## Data evaluation
- The scalar type data of PHP should be evaluated to the primitive type of JavaScript
  - `boolean` => `Boolean`
  - `integer` => `number`
  - `float`/`double` => `number` (The differences between `integer` and `float` should be treated due to specific situations)
  - `string` => `string`

- The `array` type data should be evaluated to `IArray` which contains type name, element map, next available index
- The `object` type data should be evaluated to `IObject` which contains type name, property map, its class name
- The `NULL` should be evaluated to `Null`
- *The `resource` type data has not defined in this evaluator

- The `function` and closure declaration should be evaluated to `IFunction`
- The `class` declaration should be evaluated to `IClass`

## Order of evaluation
Order of evaluation of the operands of any PHP operator, including the order of evaluation of function arguments in a function-call expression, and the order of evaluation of the subexpressions within any expression is **unspecified** in any specifications.

For this evaluator, the rules should be specified clearly for development purposes. Some of them will be optimized in the future.

As mentioned in [php-langspec/expressions](https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#general): 
> The occurrence of value computation and side effects is delimited by sequence points, places in a program's execution at which all the computations and side effects previously promised are complete, and no computations or side effects of future operations have yet begun. There is a sequence point at the end of each full expression. The logical and, logical or, conditional, coalesce and function call operators each contain a sequence point.

The evaluation stack will be pushed with a Each sequence points

### Assignment
`$a = $b;`







