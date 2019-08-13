/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The definition of interperter environment.
 */

import { IMap } from "./utils/map";
import { IBindings } from "./variable";

/**
 * @description
 * Environment model.
 * @example
 * global; function; closure; class (+ function env); namespace;
 */
interface IEnv {
    name: string;       // environment name
    type: string;       // environment type
    init: object;       // contains initialization of this environment
    bind: IBindings;    // variable bindings
    outer: number;      // outer environment
    encls: {
        _class: number[];
        _function: number[];
        _closure: number[];
        _namespace: number[];
    };                  // enclosed environments
    stati: {
        _property: IBindings;
        _method: object;
    };                  // static
    meta: object;       // other information ?
}

/**
 * @description
 * An environment is a sequence of frames.
 * Each frame is a table (possibly empty) of bindings, which associate variable names with their corresponding values.
 * Each frame also has a pointer to its enclosing environment.
 * Without any namespace definition, all class and function definitions are placed into the global space
 */
class Env {
    public env: IMap<IEnv>;     // a sequence of environments, notice that the first one is the global environment
    public idx: number = 0;     // current environment
    constructor() {
        this.env = {};
        // initialize global environment
        this.env[0] = {
            bind: {
                hstore: {},
                vslot: {},
                vstore: {},
            },
            encls: {
                _class: [],
                _closure: [],
                _function: [],
                _namespace: [],
            },
            init: null,
            meta: null,
            name: "global",
            outer: null,
            stati: null,
            type: "global",
        };
    }
}

export { Env };
