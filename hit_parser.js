const HITNode = require("./hit_node");
const Parser = require("web-tree-sitter");

function HITParse(text) {
  return Parser.init().then(() => {
    return Parser.Language.load('lib/tree-sitter-hit.wasm').then((hitLang) => {
      // parse the source text
      var parser = new Parser;
      parser.setLanguage(hitLang);
      var tree = parser.parse(text);

      // convert the tree into a HITNode tree
      var root = new HITNode();
      function traverse(node, path = []) {
        for (var child of node.children) {
          if (child.type === 'parameter_definition') {
            if (child.children.length != 3 || child.child(0).type != 'parameter_name' || child.child(2).type != 'parameter_value') {
              throw new Error("Malformed parameter");
            }
            root.get(path)[child.child(0).text] = child.child(2).text;
          } else if (child.type === 'block' || child.type === 'top_block') {
            if (child.children.length < 2 || child.child(1).type != 'block_path') {
              throw new Error("Malformed block");
            }
            traverse(child, path.concat([child.child(1).text]));
          }
        }
      }
      traverse(tree.rootNode);

      // return the HITNode tree
      return root;
    });
  });
}

module.exports = HITParse;
