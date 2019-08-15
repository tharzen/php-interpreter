/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The definition of evaluator's environment
 */

import { IBindings, IClass, IFunction, IInterface } from "./memory";

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
    public heap: {
        _var: IBindings;                    // variable bindings
        _class: Map<string, IClass>;
        _function: Map<string, IFunction>;
        _namespace: Map<string, Env>;       // as of PHP 5.3
        _trait: Map<string, IClass>;        // as of PHP 5.4
        _interface: Map<string, IInterface>;
    };
    public outEnv: number;                  // outer environment
    public subEnv: number[];                // sub environment, evaluator.env.get(...)
}

/**
 * When the program starts, evaluater will init global environment first.
 * When encounter with:
 *      - variable, stored in heap `_var`
 *      - class (declaration), evaluator will evaluate it as a IClass model and then stored into the `_class` Map;
 *          - properties will be stored in `IClass.property`
 *          - methods will be stored in `IClass.method`
 *      - function (declaration), evaluator will evaluate it as a IFunction model and then stored into the `_function` Map;
 *      - trait, same as class
 *      - namespace, create a new environment, save to `_namespace` Map, and then do things in that environment
 *
 *      - call function or a closure, the evaluator will create a new environment,
 *                                    and pass the arguments or `use` parent environment's variables in it
 *      - new a object, create a new object and stored in heap `_var`
 */
