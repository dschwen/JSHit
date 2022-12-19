# JSHit

JSHit is a Javascript librarty to build, parse, modify, and serialize HIT syntax trees. HIT is the input file format
for the [MOOSE framework](https://mooseframework.inl.gov).

## Reference

### `HITNode`

`HITNode` represents a block (or the top level of the input), that can have subblocks (which are also `HITNode` objects) and
parameter/value pairs. For parameters a `HITNode` behaves like a Javascript Object and values can be accessed using the `[]` operator.

### `constructor(name)`

`var diffusion = new HITNode('diffusion');` constructes a new block with the name `diffusion`. The name is optional and is only required if the constructed block is inserted in a tree.

`var root = new HITNode();` constructs an _unnamed_ note that could serve as the root for a new tree.

### `block(path)`

The `block` function will return a reference to any subblock of the current node, that is indexed by the given path. The `block` method
will insert all required levels of subblocks and will always return a valid `HITNode` reference.

### `index()`

The `index` method will build an internal index of all `{{...}}` placeholder values. Any tree must be indexed prior to calling the `set` method.

### `set(key, value)`

`set` will replace all occurences of the `{{key}}` placeholder with value. `set` can be called repeatedly for each `key` as the locations of the
placeholders are stored when indexing the tree using the `index` method.

### `print()`

A tree can be serialized into a HIT string using the `print` method.

### `insert(node)`

A seperately constructed node or subtree can be inserted as a child to the current node using the `insert` method.

```
const HITNode = require("./hit_node");

var root = new HITNode();
var kernels = root.block("Kernels");

diffusion = new HITNode('diffusion')
diffusion.type = 'Diffusion';
diffusion.variable = 'u';

kernels.insert(diffusion);
console.log(root.print());
```

will print

```
[Kernels]
  [diffusion]
    type = Diffusion
    variable = u
  []
[]
```

### `merge(node)`

`merge` will combine the contents of `node` into the current node adding parameters and subblocks of `node` as parameters and subblocks of the current node.

## Examples

### Building and serializing a HIT tree

```
const HITNode = require("./hit_node");

root = new HITNode();
all = root.block("Modules/TensorMechanics/Master/all");
all['stress'] = 'FINTE';

console.log(root.print());
```

will print

```
[Modules]
  [TensorMechanics]
    [Master]
      [all]
        stress = FINTE
      []
    []
  []
[]
```

###

### Parsing an input file

Given an input file text `input_text` a modifiable HIT tree can be build using `HITParse`

```
const HITParse = require("./hit_parser");

HITParse(input_text).then(root => {
  // do something with the root node
});

```
