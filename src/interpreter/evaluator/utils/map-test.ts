/**
 * @description
 * Test file for map data structure.
 */
import { IMap } from "./map";

const map: IMap<number> = {};
map.z = 1;
map["a"] = 456;
console.log(map);
console.log(map["a"]);
console.log(Object.keys(map).length);

// logical delete
map[123] = undefined;
console.log(Object.keys(map).length);
console.log(map);

// physical delete
delete map[123];
console.log(Object.keys(map).length);
console.log(map);

let a = map[666];
console.log(a);
a = 777;
console.log(map);

map[1] = 999;
console.log(map);
map[0] = 888;
console.log(map);
