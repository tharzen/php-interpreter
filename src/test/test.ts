import fs = require("fs");
import util = require("util");
import engine = require("../interpreter/php-parser/src/index");

const parser: any = new engine({
    // options
    ast: {
        withPositions: true,
    },
    parser: {
        locations: true,
    },
});

// Retrieve the AST from the specified source
// var eval = parser.parseEval('echo "My first PHP script!";');
const phpFile = fs.readFileSync(__dirname + "/myTest.php");

const ast = parser.parseCode(phpFile.toString());
// console.log(util.inspect(parser, { depth: null }));
console.log(util.inspect(ast, { depth: null }));
