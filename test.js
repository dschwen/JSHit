const HITNode = require("./hit_node");
const HITParse = require("./hit_parser");

function line() {
  console.log('-'.repeat(20));
}
var root = new HITNode();

var all = root.block("Modules/TensorMechanics/Master/all");
all['stress'] = 'FINTE'
all['add_variables'] = true;
all['generate_outputs'] = ['von_mises_stress', 'stress_xx', 'stress_yy'];

var kernels = root.block("Kernels");

var diffusion = new HITNode('diffusion')
diffusion.type = 'Diffusion';
diffusion.variable = 'u';

var dt = new HITNode('dt')
dt.type = 'TimeDerivative';
dt.variable = 'u';

kernels.insert(diffusion);
kernels.insert(dt);

root.block("Kernels/diffusion")['coefficient'] = '{{diff_coeff}}';
root.block("Kernels/dt")['other_coefficient'] = '{{diff_coeff}}';

var text = root.print();
console.log(text);
line();

HITParse(text).then(r => {
  console.log(r.print());

  // substitute the placeholder values
  r.set('diff_coeff', 123.4);
  console.log(r.print());
  line();

  // parse another input snippet
  HITParse("[Executioner]\ntype=Steady\n[Timestepper]type=IterationDT\ndt=1.0\nfactor={{diff_coeff}}\n[]\n[]").then(r2 => {
    // merge it into the previously parsed tree
    r.merge(r2);
    console.log(r.print());
    line();

    // and substitute again
    r.set('diff_coeff', 567.8);
    console.log(r.print());
  });
});

