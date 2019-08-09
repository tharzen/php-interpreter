/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for the definition of interperter environment.
 */

import { LinkedList } from "./utils/linkedlist";
import { IMap } from "./utils/map";
import { IHStoreMap, IVSlotMap, IVStoreMap } from "./variable";

/**
 * @description
 * The bindings in an environment is 3 maps: variable name => vstore id => vstore => hstore id => hstore
 * @example
 * `$a = 1;` means add "a" into vslot, 1 into vstore whose hstore id is null
 * `$b = $a;` is copying all `$a` information to `$b`,
 *            which means add "b" into vslot, add another 1 into vstore whose hstore id is null
 * `$c = &$a;` is copying by reference, which means add "c" into vslot, the vstore id of "c" is the same as "a"
 */
interface IBindings {
    vslot: IVSlotMap;   // name     => name                 + vstoreid
    vstore: IVStoreMap; // vstoreid => vstore, type, val    + hstoreid
    hstore: IHStoreMap; // hstoreid => hstore => data
}

interface IEnv {
    bindings: IBindings;
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
    public staticEnv: IMap<IBindings>;

    constructor() {
        this.env = new LinkedList<IEnv>();
        this.staticEnv = {};
    }
}

export { Env };
