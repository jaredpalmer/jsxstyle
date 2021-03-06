'use strict';

const t = require('babel-types');
const path = require('path');
const generate = require('babel-generator').default;
const vm = require('vm');

const canEvaluate = require('./canEvaluate');
const canEvaluateObject = require('./canEvaluateObject');
const getSourceModule = require('./getSourceModule');

function getStaticBindingsForScope(scope, whitelist = [], sourceFileName) {
  const bindings = scope.getAllBindings();
  const ret = {};

  const sourceDir = path.dirname(sourceFileName);

  for (const k in bindings) {
    const binding = bindings[k];

    // check to see if the item is a module
    const sourceModule = getSourceModule(k, binding);
    if (sourceModule) {
      let moduleName = sourceModule.sourceModule;

      // if modulePath is an absolute or relative path
      if (
        sourceModule.sourceModule.startsWith('.') ||
        sourceModule.sourceModule.startsWith('/')
      ) {
        // if moduleName doesn't end with an extension, add .js
        if (path.extname(moduleName) === '') {
          moduleName += '.js';
        }
        // get absolute path
        moduleName = path.resolve(sourceDir, moduleName);
      }

      if (whitelist.indexOf(moduleName) > -1) {
        const src = require(moduleName);
        if (sourceModule.destructured) {
          ret[k] = src[sourceModule.imported];
        } else {
          // crude esmodule check
          // TODO: make sure this actually works
          if (src && src.__esModule) {
            ret[k] = src.default;
          } else {
            ret[k] = src;
          }
        }
      }
      continue;
    } else if (
      t.isVariableDeclaration(binding.path.parent) &&
      binding.path.parent.kind === 'const'
    ) {
      // pick out the right variable declarator
      const dec = binding.path.parent.declarations.find(
        d => t.isIdentifier(d.id) && d.id.name === k
      );
      // TODO: handle spread syntax
      if (!dec) continue;

      if (
        canEvaluate(null, dec.init) ||
        // if dec.init is an object defined in the program root, evaluate it
        // NOTE: this assumes that objects defined in the program root are not mutated!
        // TODO: make this behaviour opt-in (?)
        (binding.path.parentPath.parentPath.type === 'Program' &&
          canEvaluateObject(null, dec.init))
      ) {
        ret[k] = vm.runInNewContext('(' + generate(dec.init).code + ')');
      }
    }
  }

  return ret;
}

module.exports = getStaticBindingsForScope;
