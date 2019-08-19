/**
 * @authors https://github.com/eou/php-interpreter
 * @description The definition of memory model basically for storing variables
 * @see https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#the-memory-model
 */

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
 * @param {number | string} name
 * @param {modifiers} modifiers
 * @param {number} vstoreAddr
 */
export interface IVSlot {
    name: number | string;  // if it is an offset in an array, it could be integer or string
    modifiers: modifiers;
    vstoreAddr: number;     // vstore address in Heap
}

/**
 * @description
 * A value storage location (VStore) is used to represent a program value,
 * and is created by the Engine as needed.
 * A VStore can contain a scalar value such as an integer or a Boolean,
 * or it can contain a handle pointing to an HStore.
 * @param {string} type - number, boolean, string, array(an array in PHP is actually an ordered map), object...
 * @param {number | boolean | string} val - only scalar type in vstore
 * @param {number} hstoreAddr - hstore address in Heap
 * @param {number} refcount - reference-counting
 */
export interface IVStore {
    type: string;
    val: number | boolean | string;
    hstoreAddr: number;
    refcount: number;
}

/**
 * @description
 * A heap storage location (HStore) is used to represent the contents of a composite value,
 * and is created by the Engine as needed. HStore is a container which contains VSlots.
 * [VSlot $a *] --> [VStore array *] --> [HStore array [VSlot 0 *] [VSlot 'B' *]]
 *                                                        ↓            ↓
 *                                                        ↓            ↓
 *                                              [VStore int 10]   [VStore Obj *] -> [...]
 *
 * [VSlot $a *] --> [VStore object *] --> [HStore Point [VSlot $x *] [VSlot $y *]]
 *                                                          ↓            ↓
 *                                                          ↓            ↓
 *                                                 [VStore int 1]  [VStore int 3]
 * @param {string} type - array (an array in PHP is actually an ordered map), object (Point), closure
 * @param {Map} data - data could store array, object, closure,
 * @param {number} refcount - reference-counting
 * @param {any} meta - other meta information, e.g. array's next available index, object's classes
 */
export interface IHStore {
    type: string;
    data: Map<number | string, number>;    // e.g. if it is object, it should be a Map<string, number> which is property name => vslot address
    refcount: number;
    meta: any;
}

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ TYPE MODEL ████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @description
 * Array type abstract model
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/12-arrays.md
 * @param {string} type - array
 * @param {Map} elt - array elements, element name => any data
 * @param {number} idx - optimization: array next available index
 */
export interface IArray {
    type: string;
    elt: Map<string | number, any>;
    idx: number;
}

/**
 * @description
 * Object type abstract model
 * @see
 * https://www.php.net/manual/en/language.types.object.php
 * https://www.php.net/manual/en/language.oop5.php
 * @param {string} type - object
 * @param {Map} _property - data fields in object
 * @param {string} _class - object's class
 */
export interface IObject {
    type: string;
    // in order to save space and improve efficiency, directly save symbol table into IObject but not extract them
    _property: Map<string | number, number>;
    _class: string;
}

import { Node as ASTNode } from "../php-parser/src/ast/node";

/**
 * @description
 * Function or Closure type abstract model
 * @param {string} type - function, closure, method
 * @param {string} name - if it is a closure, it has no name, leave this field as ""
 * @param {string[]} args - arguments
 * @param {ASTNode} body - AST node
 * @param {Map} st - symbol table stores static variables
 */
export interface IFunction {
    type: string;
    name: string;
    args: string[];
    body: ASTNode;
    st: Map<string, number>;
}

/**
 * @description
 * Method type abstract model
 * @param {modifiers} modifiers
 * @param {string} _class - method's class
 */
export interface IMethod extends IFunction {
    modifiers: modifiers;
    _class: string;
}

/**
 * @description
 * Interface type abstract model
 * @see
 * https://www.php.net/manual/en/language.oop5.interfaces.php
 * @param {string} type - interface
 * @param {string} name
 * @param {string} _extend
 * @param {Map} _const - const variable stored in Heap
 * @param {IMethod} _method - methods stored in Heap
 */
export interface IInterface {
    type: string;
    name: string;
    _extend: string;
    _const: Map<string, number>;
    _method: Map<string, number>;
}

/**
 * @description
 * Class type abstract model
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/14-classes.md
 * https://www.php.net/manual/en/language.oop5.php
 * @param {modifiers} modifiers
 * @param {string} type - class
 * @param {string} name
 * @param {string} _extend - parent class
 * @param {Map} _property - data fields stored in Heap
 * @param {Map} _method - methods stored in Heap
 */
export interface IClass {
    modifiers: modifiers;
    type: string;
    name: string;
    _extend: string;
    _property: Map<string, number>;
    _method: Map<string, number>;
}

/**
 * @description
 * Memory location model, find variables in specific environment
 * @param {string} type - number, boolean, string, object, array, null
 * @param {number} idx - environment index
 * @param {number} vslotAddr - vslot address
 * @param {number} vstoreAddr - vstore address
 * @param {number} hstoreAddr - hstore address
 * @param {number} offset - for string offset
 */
export interface ILocation {
    type: string;
    env: number;
    vslotAddr: number;
    vstoreAddr: number;
    hstoreAddr?: number;
    offset?: number;
}

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ MEMORY API ████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

import { IHeap } from "./evaluator";

/**
 * @description
 * Memory model API: create a empty variable in the heap and return its vslot address
 * @param {IHeap} heap
 * @param {string} varname - variable name
 * @param {string} type - variable type
 * @param {any} val - variable value
 */
export function createVariable(heap: IHeap, varname: number | string, type?: string): number {
    const newVslotAddr = heap.ptr++;
    const newVstoreAddr = heap.ptr++;
    const newVslot: IVSlot = {
        modifiers: [false, false, false, false, false, false, false, false],
        name: varname,
        vstoreAddr: newVstoreAddr,
    };
    const newVstore: IVStore = {
        hstoreAddr: null,
        refcount: 1,
        type, // maybe undefined
        val: null,
    };
    if (type && type !== "boolean" && type !== "number" && type !== "string") {
        // non-scalar type, need hstore
        const newHstoreAddr = heap.ptr++;
        const newHstore: IHStore = {
            data: null,
            meta: null,
            refcount: 1,
            type,
        };
        newVstore.hstoreAddr = newHstoreAddr;
        heap.ram.set(newHstoreAddr, newHstore);
    }
    heap.ram.set(newVslotAddr, newVslot);
    heap.ram.set(newVstoreAddr, newVstore);
    return newVslotAddr;
}

/**
 * @description
 * Memory model API: get a variable value from an environment
 * @param {number} vslotAddr
 * @param {IHeap} heap
 */
export function getValue(vslotAddr: number, heap: IHeap) {
    const vslot: IVSlot = heap.ram.get(vslotAddr);
    if (vslot === undefined) {
        return undefined;
    }

    const vstore: IVStore = heap.ram.get(vslot.vstoreAddr);
    const type = vstore.type;
    // scalar type
    if (type === "boolean" || type === "number" || type === "string") {
        return vstore.val;
    } else if (type === "array") {
        // extract IArray model from the Heap
        const array: IArray = {
            elt: new Map(),
            idx: null,
            type: "array",
        };
        const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
        array.idx = hstore.meta;    // next available index
        if (hstore.data) {
            // iterate the hstore's vslot to get elements' name
            for (const eltName of hstore.data.keys()) {
                array.elt.set(eltName, getValue(hstore.data.get(eltName), heap));
            }
        }
        return array;
    } else if (type === "object") {
        const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
        const object: IObject = {
            _class: "",
            _property: new Map(),
            type: "object",
        };
        object._class = hstore.meta;
        object._property = hstore.data;
        return object;
    } else if (type === "closure") {
        const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
        const closureAddr = hstore.data.values().next().value;  // if it is IFunction, it should be Map's first value
        return heap.ram.get(closureAddr);
    } else if (type === "null") {
        return null;
    } else {
        throw new Error("Eval Error: unidentified data type.");
    }
}

/**
 * @description
 * Memory model API: set a variable value in an environment
 */
export function setValue(vslotAddr: number, heap: IHeap, value: any) {
    const vslot: IVSlot = heap.ram.get(vslotAddr);
    if (vslot === undefined) {
        throw new Error("Eval error: cannot set value to undefined variable.");
    }

    const vstore: IVStore = heap.ram.get(vslot.vstoreAddr);
    switch (typeof value) {
        case "boolean":
        case "number":
        case "string": {
            vstore.type = typeof value;
            vstore.val = value;
            vstore.hstoreAddr = undefined;
            const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
            if (hstore !== undefined) {
                if (hstore.refcount !== 1) {
                    hstore.refcount -= 1;
                } else {
                    heap.ram.delete(vstore.hstoreAddr);
                }
                vstore.hstoreAddr = undefined;
            }
            break;
        }
        case "object": {
            if (value.type === "array") {
                // IArray
                vstore.type = "array";
                vstore.val = undefined;     // for array data type, we do not use vstore.val
                if (vstore.hstoreAddr !== undefined) {
                    // remove previous connections
                    const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
                    if (hstore !== undefined) {
                        if (hstore.refcount !== 1) {
                            hstore.refcount -= 1;
                        } else {
                            heap.ram.delete(vstore.hstoreAddr);
                        }
                    }
                }
                // create hstore to store the array
                const newHstoreAddr = heap.ptr++;
                vstore.hstoreAddr = newHstoreAddr;
                const initNewHstore = {
                    data: new Map(),
                    meta: value.idx,
                    refcount: 1,
                    type: "array",
                };
                heap.ram.set(newHstoreAddr, initNewHstore);
                const newHstore: IHStore = heap.ram.get(newHstoreAddr);
                value.elt.forEach((val: any, key: number | string, _: any) => {
                    // for each element in array, create a new variable model, key is vslot name, val is its value
                    const newVslotAddr = createVariable(heap, key);
                    // and then set its value
                    setValue(newVslotAddr, heap, val);
                    newHstore.data.set(key, newVslotAddr);
                });
            } else if (value.type === "object") {
                // IObject
                vstore.type = "object";
                vstore.val = undefined;
                if (vstore.hstoreAddr !== undefined) {
                    // remove previous connections
                    const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
                    if (hstore !== undefined) {
                        if (hstore.refcount !== 1) {
                            hstore.refcount -= 1;
                        } else {
                            heap.ram.delete(vstore.hstoreAddr);
                        }
                    }
                }
                const newHstoreAddr = heap.ptr++;
                vstore.hstoreAddr = newHstoreAddr;
                const initNewHstore = {
                    data: value._property,
                    meta: value._class,
                    refcount: 1,
                    type: "object",
                };
                heap.ram.set(newHstoreAddr, initNewHstore);
            } else if (value.type === "closure") {
                // IFunction
                vstore.type = "closure";
                vstore.val = undefined;
                if (vstore.hstoreAddr !== undefined) {
                    // remove previous connection
                    const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
                    if (hstore !== undefined) {
                        if (hstore.refcount !== 1) {
                            hstore.refcount -= 1;
                        } else {
                            heap.ram.delete(vstore.hstoreAddr);
                        }
                    }
                }
                const newHstoreAddr = heap.ptr++;
                vstore.hstoreAddr = newHstoreAddr;
                const initNewHstore = {
                    data: value,
                    meta: null,
                    refcount: 1,
                    type: "closure",
                };
                heap.ram.set(newHstoreAddr, initNewHstore);
            } else if (value === null) {
                vstore.type = "null";
                vstore.val = value;
                if (vstore.hstoreAddr !== undefined) {
                    // remove previous connection
                    const hstore: IHStore = heap.ram.get(vstore.hstoreAddr);
                    if (hstore !== undefined) {
                        if (hstore.refcount !== 1) {
                            hstore.refcount -= 1;
                        } else {
                            heap.ram.delete(vstore.hstoreAddr);
                        }
                    }
                    vstore.hstoreAddr = undefined;
                }
            } else {
                throw new Error("Eval error: cannot set value to variables with undefined type.");
            }
            break;
        }
        default:
            break;
    }
}
