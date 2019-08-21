// import fs = require("fs");
// import util = require("util");
// import engine = require("../interpreter/php-parser/src/index");

// const parser: any = new engine({
//     // options
//     ast: {
//         withPositions: true,
//     },
//     parser: {
//         locations: true,
//     },
// });

// // Retrieve the AST from the specified source
// // var eval = parser.parseEval('echo "My first PHP script!";');
// const phpFile = fs.readFileSync(__dirname + "/myTest.php");

// const ast = parser.parseCode(phpFile.toString());
// // console.log(util.inspect(parser, { depth: null }));
// console.log(util.inspect(ast, { depth: null }));

// let a = { b: { key: { val : 2}}, x : { bug: { e: "123" }, bug2: { d : ""} }};
// // let c = { ... a, b: { ... a.b}};
// let c = JSON.parse(JSON.stringify(a));
// console.log(a);
// console.log(c);
// c.b.key.val = 666;
// console.log(a);
// console.log(c);
// c.x.bug.e = "???";
// console.log(a);
// console.log(c);

// type x = [boolean, boolean];
// let a: x = [true, true];
// a[1] = false;
// console.log(a);

// function x(a: string, b: boolean) {
//     console.log(a);
//     console.log(b);
// }

// x("1", "2");
