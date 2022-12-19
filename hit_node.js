const placeholder = /^\{\{(.*)\}\}$/;

module.exports = class HITNode {
  #name;
  #subblocks;
  #index;

  constructor(name) {
    this.#name = name;
    this.#subblocks = {};
    this.#index = {};
  }

  block(path) {
    if (path.length === 0) return this;

    if (typeof path === "string") {
      // remove leading /
      if (path[0] === '/') return this.block(path.substring(1))

      return this.block(path.split('/'));
    }

    // recurse through the object tree
    var subblock = path[0];

    // create node if it does not exist
    if (!(subblock in this.#subblocks)) {
      this.#subblocks[subblock] = new HITNode(subblock);
    }

    return this.#subblocks[subblock].block(path.slice(1));
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

  // prepare a tree to enable teh set method for {{}} placeholder values
  index() {
    // index this blocks parameters
    for (var name of Object.keys(this)) {
      var match = this[name].match(placeholder);
      if (match) {
        if (match[1] in this.#index) {
          this.#index[match[1]].push([this, name]);
        } else {
          this.#index[match[1]] = [[this, name]];
        }
      }
    }

    // index subblocks
    for (var block in this.#subblocks) {
      this.#subblocks[block].index();

      // propagate index up
      var subindex = this.#subblocks[block].#index;
      for (var item in subindex) {
        if (item in this.#index) {
          this.#index[item] = this.#index[item].concat(subindex[item]);
        } else {
          this.#index[item] = subindex[item];
        }
      }
    }
  }

  // set an indexed {{}} placeholder value
  set(key, value) {
    if (key in this.#index) {
      for (var idx of this.#index[key]) {
        idx[0][idx[1]] = value;
      }
    } else {
      throw new Error("Placeholder value not found");
    }
  }
}
