/**
 * @authors https://github.com/eou/php-interpreter
 * @description The definition of variable memory model.
 * The abstract memory model used by PHP for storing variables.
 * [VSlot $a *] --> [VStore object *] --> [HStore Point [VSlot $x *] [VSlot $y *]]
 *                                                          ↓             ↓
 *                                                          ↓             ↓
 *                                                   [VStore int 1]  [VStore int 3]
 * @see https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#the-memory-model
 */

import { IMap } from "./utils/map";

/**
 * @description
 * A variable slot (VSlot) is used to represent a variable named by the programmer in the source code,
 * such as a local variable, an array element, an instance property of an object, or a static property of a class.
 * A VSlot comes into being based on explicit usage of a variable in the source code.
 * A VSlot contains a pointer to a VStore.
 */
interface IVSlot {
    name: number | string;  // if it is a offset in an array, it could be integer or string
    // current env can access variable in global env using `global`
    // in this implementation the local variable set a reference to the global variable with the same name
    // if the target global varibale does not exist, create a new one then reference to it
    // thus the vstoreId here points to the vstore in global environment for global variables
    scope: string;      // global, public, protected, private
    vstoreId: number;   // since there is no pointer in TypeScript, we use `vstoreid` to find the correspond VStore
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
    val: number | boolean | string | null;   // only scalar type
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
    data: IBindings;  // data fields in the object
    refcount: number;   // reference-counting
    meta?: any;  // other meta information for optimization, e.g. array's next available index, object's class
}

/**
 * @description
 * A variable slot (VSlot) map which represents an object that maps variable name to VSlot
 */
type IVSlotMap = IMap<IVSlot>;

/**
 * @description
 * A value storage location (VStore) map which represents an object that maps VStoreid to VStore
 */
type IVStoreMap = IMap<IVStore>;

/**
 * @description
 * A heap storage location (HStore) map which represents an object that maps HStoreid to HStore
 */
type IHStoreMap = IMap<IHStore>;

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
    vslot: IVSlotMap;   // name     => name                 + vstoreid
    vstore: IVStoreMap; // vstoreid => vstore, type, val    + hstoreid
    hstore: IHStoreMap; // hstoreid => hstore => data
}

export interface ILocation {
    global: boolean;
    vslotName: string;
    vstoreId: number;
    hstoreId: number;
}
