const HITNode = require("./hit_node");
const HITParse = require("./hit_parser");

root = new HITNode();

all = root.get("Modules/TensorMechanics/Master/all");
all['stress'] = 'FINTE'
all['add_variables'] = true;
all['generate_outputs'] = ['von_mises_stress', 'stress_xx', 'stress_yy'];

kernels = root.get("Kernels");

diffusion = new HITNode('diffusion')
diffusion.type = 'Diffusion';
diffusion.variable = 'u';

dt = new HITNode('dt')
dt.type = 'TimeDerivative';
dt.variable = 'u';

kernels.insert(diffusion);
kernels.insert(dt);

root.get("Kernels/diffusion")['coefficient'] = 5.9;

text = root.print();
console.log(text);

HITParse(text).then((r) => console.log(r.print()));
