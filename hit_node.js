module.exports = class HITNode {
  #name;
  #subblocks;

  constructor(name) {
    this.#name = name;
    this.#subblocks = {};
  }

  get(path) {
    if (path.length === 0) return this;

    if (typeof path === "string") {
      // remove leading /
      if (path[0] === '/') return this.get(path.substring(1))

      return this.get(path.split('/'));
    }

    // recurse through the object tree
    var subblock = path[0];

    // create node if it does not exist
    if (!(subblock in this.#subblocks)) {
      this.#subblocks[subblock] = new HITNode(subblock);
    }

    return this.#subblocks[subblock].get(path.slice(1));
  }

  print(indent_level = '', indent = '  ') {
    var text = '';

    // add parameters
    var nParams = 0;
    for (var name of Object.keys(this)) {
      var value = this[name];
      if (Array.isArray(value)) {
        value = "'" + value.join(' ') + "'";
      }
      text += indent_level + name + ' = ' + value + '\n';
      nParams++;
    }

    // add subblocks
    var nBlocks = 0;
    for (var block in this.#subblocks) {
      if (nBlocks++ > 0) text += '\n';
      text += indent_level + '[' + block + ']\n';
      text += this.#subblocks[block].print(indent_level + indent, indent);
      text += indent_level + '[]\n';
    }

    return text;
  }

  insert(block) {
    this.#subblocks[block.#name] = block;
  }
}

