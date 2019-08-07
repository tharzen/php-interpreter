/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for the definition of interperter environment.
 */

import { LinkedList } from "./utils/linkedlist";
import { Var } from "./variable";

interface IMap<T> {
    [key: string]: T;
}

type bindings = IMap<Var>;   // $a => VAR($a, ...)

interface IEnv {
    bindings: bindings;
    meta: object;       // other information besides bindings in this environment
    // maybe more meta information here
}
/**
 * @description
 * An environment is a sequence of frames.
 * Each frame is a table (possibly empty) of bindings, which associate variable names with their corresponding values.
 * Each frame also has a pointer to its enclosing environment.
 * Without any namespace definition, all class and function definitions are placed into the global space
 */
class Env {
    // a linkedlist of environments, notice that the head is the global environment
    public env: LinkedList<IEnv>;
    // a map stores static variable, note that function name will be func_xxx, and class name will be class_xx
    public staticEnv: IMap<bindings>;

    constructor() {
        this.env = new LinkedList<IEnv>();
        this.staticEnv = {};
    }
}

export { Env };
