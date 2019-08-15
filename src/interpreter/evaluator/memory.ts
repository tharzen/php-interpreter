/**
 * @authors https://github.com/eou/php-interpreter
 * @description The definition of memory model
 * @see https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#the-memory-model
 */

import { Node as ASTNode } from "../php-parser/src/ast/node";

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ MEMORY MODEL ██████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

// modifiers:     global,  static,  const,  public, protected, private, final,  abstract
type modifiers = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

/**
 * @description
 * A variable slot (VSlot) is used to represent a variable named by the programmer in the source code,
 * such as a local variable, an array element, an instance property of an object, or a static property of a class.
 * A VSlot comes into being based on explicit usage of a variable in the source code.
 * A VSlot contains a pointer to a VStore.
 */
interface IVSlot {
    name: number | string;  // if it is a offset in an array, it could be integer or string
    modifiers: modifiers;
    vstoreId: number;       // since there is no pointer in TypeScript, we use `vstoreid` to find the correspond VStore
}

/**
 * @description
 * A value storage location (VStore) is used to represent a program value,
 * and is created by the Engine as needed.
 * A VStore can contain a scalar value such as an integer or a Boolean,
 * or it can contain a handle pointing to an HStore.
 */
interface IVStore {
    type: string;   // number, boolean, string, array(an array in PHP is actually an ordered map), object...
    val: number | boolean | string;   // only scalar type
    hstoreId: number;     // since there is no pointer in TypeScript, we use `hstoreid` to find the correspond HStore
    refcount: number;   // reference-counting
}

/**
 * @description
 * A heap storage location (HStore) is used to represent the contents of a composite value,
 * and is created by the Engine as needed. HStore is a container which contains VSlots.
 */
interface IHStore {
    type: string;   //  array (an array in PHP is actually an ordered map), object (Point), ...
    data: any;  // data fields in the object, could be IBindings (object) or IFunction (closure)
    refcount: number;   // reference-counting
    meta: any;  // other meta information, e.g. array's next available index, object's classes
}

/**
 * @description
 * The bindings in an environment is 3 maps: variable name => vstore id => vstore => hstore id => hstore
 * @example
 * `$a = 1;`    means add "a" into vslot, 1 into vstore whose hstore id is null
 * `$b = $a;`   is copying all `$a` information to `$b`,
 *                  which means add "b" into vslot, add another 1 into vstore whose hstore id is null
 * `$c = &$a;`  is copying by reference
 *                  which means add "c" into vslot, the vstore id of "c" is the same as "a"
 */
export interface IBindings {
    vslot: Map<string, IVSlot>;   // variable name => vslot (+ vstoreid)
    vstore: Map<number, IVStore>; // vstore id => vstore, type, val (+ hstoreid)
    hstore: Map<number, IHStore>; // hstore id => hstore => data (bindings)
}

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ TYPE MODEL ████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @description
 * Memory location model
 */
export interface ILocation {
    global: boolean;
    vslotName: string;
    vstoreId: number;
    hstoreId: number;
}

/**
 * @description
 * Array type abstract model
 * [VSlot $a *] --> [VStore array *] --> [HStore array [VSlot 0 *] [VSlot 'B' *]]
 *                                                        ↓            ↓
 *                                                        ↓            ↓
 *                                              [VStore int 10]   [VStore Obj *] -> [...]
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/12-arrays.md
 */
export interface IArray {
    type: string;           // array
    elt: Map<string, any>;  // array elements
    idx: number;            // optimization: array next available index
}

/**
 * @description
 * Object type abstract model
 * [VSlot $a *] --> [VStore object *] --> [HStore Point [VSlot $x *] [VSlot $y *]]
 *                                                          ↓            ↓
 *                                                          ↓            ↓
 *                                                 [VStore int 1]  [VStore int 3]
 * @see
 * https://www.php.net/manual/en/language.types.object.php
 * https://www.php.net/manual/en/language.oop5.php
 */
export interface IObject {
    type: string;            // object
    _property: IBindings;    // data fields, object is like an environment
    _class: string;          // belong
}

/**
 * @description
 * Function or Closure type abstract model
 */
export interface IFunction {
    type: string;           // function, closure
    name: string;           // if it is a closure, it has no name, leave this field as ""
    args: string[];         // arguments
    body: ASTNode;          // AST node
}

/**
 * @description
 * Method type abstract model
 */
export interface IMethod extends IFunction {
    modifiers: modifiers;
    _class: string;            // belong
}

/**
 * @description
 * Interface type abstract model
 * @see
 * https://www.php.net/manual/en/language.oop5.interfaces.php
 */
export interface IInterface {
    type: string;       // interface
    name: string;
    _extend: string;
    _const: Map<string, any>;
    _method: IFunction;
}

/**
 * @description
 * Class type abstract model
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/14-classes.md
 * https://www.php.net/manual/en/language.oop5.php
 */
export interface IClass {
    modifiers: modifiers;
    type: string;                   // class
    name: string;
    _extend: string;                // parent class
    _property: IBindings;
    _method: Map<string, IMethod>;   // name => function
}

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ MEMORY API ████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @description
 * Memory model API: get a variable value from an environment
 */
export function getValue(bind: IBindings, vslotName: string) {
    const vslot = bind.vslot.get(vslotName);
    const vstore = bind.vstore.get(vslot.vstoreId);
    const type = vstore.type;
    // scalar type
    if (type !== "array" && type !== "object") {
        return vstore.val;
    } else if (type === "array") {
        const array: IArray = {
            elt: new Map(),
            idx: null,
            type: "array",
        };
        const hstore = bind.hstore.get(vstore.hstoreId);
        array.idx = hstore.meta;    // next available index
        // iterate the hstore's vslot to get elements' name
        for (const eltName of hstore.data.vslot.keys()) {
            array.elt.set(eltName, getValue(hstore.data, eltName));
        }
        return array;
    } else if (type === "object") {
        const hstore = bind.hstore.get(vstore.hstoreId);
        const object: IObject = {
            _class: "",
            _property: {
                hstore: new Map(),
                vslot: new Map(),
                vstore: new Map(),
            },
            type: "object",
        };
        object._class = hstore.meta;
        object._property = JSON.parse(JSON.stringify(hstore.data));     // deep copy IBindings
        return object;
    } else if (type === "closure") {
        const hstore = bind.hstore.get(vstore.hstoreId);
        const closure = hstore.data;        // IFunction
        return closure;
    } else if (type === "null") {
        return null;
    } else {
        throw new Error("Eval Error: unidentified data type");
    }
}

/**
 * @description
 * Memory model API: set a variable value in an environment
 */
export function setValue(bind: IBindings, vslotName: string, value: any) {
    const vslot = bind.vslot.get(vslotName);
    if (vslot === undefined) {
        throw new Error("Eval error: cannot set value to undefined variable.");
    }

    const vstore = bind.vstore[vslot.vstoreId];
    switch (typeof value) {
        case "boolean":
        case "number":
        case "string": {
            vstore.type = typeof value;
            vstore.val = value;
            vstore.hstoreId = undefined;
            bind.hstore.set(vstore.hstoreId, undefined);
            break;
        }
        case "object": {
            if (value.type === "array") {
                // IArray
                vstore.type = "array";
                vstore.value = undefined;
                let hstore = bind.hstore.get(vstore.hstoreId);
                if (hstore === undefined) {
                    hstore = {
                        data: null,
                        meta: null,
                        refcount: 1,
                        type: "",
                    };
                }
                hstore.type = "array";
                hstore.meta = value.idx;
                hstore.refcount = 1;
                value.elt.forEach((val: any, key: string, _: any) => {
                    hstore.data.vslot.set(key, null);    // declare a new vslot
                    setValue(hstore.data, key, val);     // set its value
                });
            } else if (value.type === "object") {
                // IObject
                vstore.type = "object";
                vstore.value = undefined;
                let hstore = bind.hstore.get(vstore.hstoreId);
                if (hstore === undefined) {
                    hstore = {
                        data: null,
                        meta: null,
                        refcount: 1,
                        type: "",
                    };
                }
                hstore.type = "object";
                hstore.meta = value._class;
                hstore.refcount = 1;
                hstore.data = value._property;
            } else if (value.type === "closure") {
                // IFunction
                vstore.type = "closure";
                vstore.val = undefined;
                let hstore = bind.hstore.get(vstore.hstoreId);
                if (hstore === undefined) {
                    hstore = {
                        data: null,
                        meta: null,
                        refcount: 1,
                        type: "",
                    };
                }
                hstore.type = "closure";
                hstore.meta = null;
                hstore.refcount = 1;
                hstore.data = value;
            } else if (value === null) {
                vstore.type = "null";
                vstore.val = value;
                vstore.hstoreId = undefined;
                bind.hstore.set(vstore.hstoreId, undefined);
            } else {
                throw new Error("Eval error: cannot set value to variables with undefined type.");
            }
            break;
        }
        default:
            break;
    }
}
