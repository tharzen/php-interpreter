/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for definition of variable memory model.
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
    name: string;
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
    hstoreId?: number;     // since there is no pointer in TypeScript, we use `hstoreid` to find the correspond HStore
    // refcount: number;   // reference-counting
}

/**
 * @description
 * A heap storage location (HStore) is used to represent the contents of a composite value,
 * and is created by the Engine as needed. HStore is a container which contains VSlots.
 */
interface IHStore {
    type: string;   //  array(an array in PHP is actually an ordered map), object (Point), ...
    data: IVSlot | object;  // data fields in the object
    // refcount: number;   // reference-counting
}

/**
 * @description
 * A variable slot (VSlot) map which represents an object that maps variable name to VSlot
 */
export type IVSlotMap = IMap<IVSlot>;

/**
 * @description
 * A value storage location (VStore) map which represents an object that maps VStoreid to VStore
 */
export type IVStoreMap = IMap<IVStore>;

/**
 * @description
 * A heap storage location (HStore) map which represents an object that maps HStoreid to HStore
 */
export type IHStoreMap = IMap<IHStore>;
