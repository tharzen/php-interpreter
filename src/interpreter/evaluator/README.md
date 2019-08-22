# Evaluator

## Stack
There are 4 different kinds of stack nodes which responsible for different scenarios.
1. `ast` means this node contains a AST node
2. `value` means this node contains a PHP data
3. `address` means this node contains a memory address
4. `instruction` means this node contains a instruction which guides next few evaluation steps

And it is necessary to put all evaluation information into the stack without any auxiliary containers. 

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

The evaluation stack will be pushed with a "End" node before evaluating each `expressionstatement`, such as `endOfAssign`. If there is `$a = $b = 1;`, we only push the End node once due to `;`.

### Assignment
For `$a = $b;`, after popping it from the stack, pushing the right expression and then the left expression into stack. In this way, we start evaluating left expression first. 
The nodes in the stack from bottom to top are:
`endOfAssign` => `assign` => right expressions (getValue) => left expressions (getAddress).

After the evaluator evaluates left expressions and puts its memory address back into stack, the stack will pop the address and next node: right expressions (getValue). Before evaluating right expressions, the address node needed to be pushed into stack again (we should not use any other containers saving this). 
`endOfAssign` => `assign` => address => right expressions (getValue).

After evaluating the right expressions, the stack will pop the right expressions' value and left expressions' address from stack. Since there are no instructions, the stack will pop next node: `assign`. Now the evaluator knows that it should store the value to that address.

After assignment finishes, the stack will push the value into stack again for next possible evaluation. If there is no nodes left but only `endOfAssign`, the stack pop them all out.

For compound assignment expressions, such as `$a += 1;`, convert it into: `$a = $a + 1;` for easier evaluation.







