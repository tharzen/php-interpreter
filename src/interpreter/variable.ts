/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for definition of variable memory model.
 */

/**
 * @description
 * A variable slot (VSlot) is used to represent a variable named by the programmer in the source code,
 * such as a local variable, an array element, an instance property of an object, or a static property of a class.
 * A VSlot comes into being based on explicit usage of a variable in the source code.
 * A VSlot contains a pointer to a VStore.
 */
interface IVSlot {
    name: string;
    val: IVStore;
}

/**
 * @description
 * A value storage location (VStore) is used to represent a program value,
 * and is created by the Engine as needed.
 * A VStore can contain a scalar value such as an integer or a Boolean,
 * or it can contain a handle pointing to an HStore.
 */
interface IVStore {
    val: number | boolean | null;
    data: IHStore;
    refcount: number;
}

/**
 * @description
 * A heap storage location (HStore) is used to represent the contents of a composite value,
 * and is created by the Engine as needed. HStore is a container which contains VSlots.
 */
interface IHStore {
    data: object;
    refcount: number;
}

class VAR {
    public VSlot: IVSlot;
    public VStore: IVStore;
    public HStore: IHStore;
    constructor(name: string, val?: number | boolean | object | null) {
        this.VSlot.name = name;
        this.VSlot.val = this.VStore;
        if (val) {
            if (typeof val === "number" || typeof val === "boolean") {
                this.VStore.val = val;
                this.VStore.data = null;
            } else {
                this.VStore.val = null;
                this.VStore.data = this.HStore;
                this.HStore.data = val;
            }
        }
    }
}

export { VAR };
