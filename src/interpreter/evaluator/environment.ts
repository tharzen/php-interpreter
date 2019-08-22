/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The definition of evaluator's environment
 */

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ ENVIRONMENT ███████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @description
 * Environment of the evaluator.
 * (SICP) Each environment frame is a table (possibly empty) of bindings, which associate variable names with their corresponding values.
 * (SICP) Each environment frame also has a pointer to its enclosing environment.
 * Without any namespace definition, all classes and functions definition are placed into the global space
 */
export class Env {
    public name: string;                    // environment name
    public type: string;                    // environment type
    public out: number;                  // outer environment
    public sub: number[];                // sub environment, evaluator.env.get(...)
    public st: ISymbolTable;       // symbol table
}

/**
 * @description
 * A symbol table is an abstract data type (ADT) for tracking various symbols in source code.
 * These symbols' addresses are stored in Heap of evaluator.
 */
export interface ISymbolTable {
    _var: Map<string, number>;          // variable name => vslot address
    _class: Map<string, number>;        // class name => address
    _function: Map<string, number>;     // function name => address
    _trait: Map<string, number>;        // trait name => address
    _interface: Map<string, number>;    // interface name => address
    _namespace: Map<string, number>;    // namespace name => address
}

/**
 * When the program starts, evaluater will init global environment first.
 * When encounter with:
 *      - variable, vslot, vstore, hstore are all stored in Heap and the vslot addresses are stored in symbol table's `_var`
 *      - class (declaration), evaluator will evaluate it as a IClass model and then store it in the Heap,
 *        its address will be stored in symbol table's `_class`.
 *          - properties will be stored in Heap and its address will be stored in the `IClass.property` which is also a symbol table
 *          - methods will be stored in Heap and its address will be stored in the `IClass.method` which is also a symbol table
 *      - function (declaration), evaluator will evaluate it as a IFunction model and then store it in the Heap,
 *        its address will be stored in symbol table's `_function`.
 *      - trait, same as class
 *      - namespace, save the AST node in the Heap
 *        and then continue evaluating in that environment
 *      - call function or a closure, the evaluator will create a new environment immediately,
 *                                    and pass the arguments or `use` parent environment's variables in it
 *      - new a object, create a new object and stored in Heap, and its property wil be stored in `IObject.property` which is also a symbol table
 */
