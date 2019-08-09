import { Var } from "./variable";

const a = new Var("a", 1);
console.log(a);

const b = new Var("b", 1.001);
console.log(b);

const c = new Var("c", "wtf");
console.log(c);

const d = new Var("abc", true);
console.log(d);
