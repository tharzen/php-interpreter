/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for the definition of interperter environment.
 * An environment is a sequence of frames.
 * Each frame is a table (possibly empty) of bindings, which associate variable names with their corresponding values.
 * Each frame also has a pointer to its enclosing environment.
 */

import { VAR } from "./variable";

interface IEnv {
    bindings: Record<string, VAR>;  // $a => VAR($a, ...)
    enclose: number[];              // points to other environment
}

class ENV {
    public frames: IEnv[];  // a sequence of frames, notice that the frames[0] is the global environment.
}

export { ENV };
