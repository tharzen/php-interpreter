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
interface ITest {
    a: any[];
}

const ar = [[[1]]];

const a: ITest = { a: [["abc", 3, 4]]  };

const b: ITest = { a: [[1, 2], [3, 4], ar, "123"] };

console.log(a);
console.log(b);
