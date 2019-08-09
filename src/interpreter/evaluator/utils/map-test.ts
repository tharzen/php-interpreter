/**
 * @description
 * Test file for map data structure.
 */
import { IMap } from "./map";

const map: IMap<number> = {};
map.a = 1;
map[123] = 456;
console.log(map);
console.log(map[123]);
console.log(Object.keys(map).length);
