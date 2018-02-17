import * as shell from 'shelljs';

// shell.cp("-R", "src/public/js/lib", "dist/public/js/");
// shell.cp("-R", "src/public/fonts", "dist/public/");
shell.cp('-R', 'src/public/images', 'dist/public/');
shell.cp('hack/feathers-nedb/index.d.ts', './node_modules/feathers-nedb/');
shell.cp('hack/feathers-nedb/index.js', './node_modules/feathers-nedb/lib');
