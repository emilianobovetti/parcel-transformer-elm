"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _plugin() {
  const data = require("@parcel/plugin");

  _plugin = function () {
    return data;
  };

  return data;
}

function _commandExists() {
  const data = _interopRequireDefault(require("command-exists"));

  _commandExists = function () {
    return data;
  };

  return data;
}

function _crossSpawn() {
  const data = _interopRequireDefault(require("cross-spawn"));

  _crossSpawn = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _terser() {
  const data = require("terser");

  _terser = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _diagnostic() {
  const data = _interopRequireDefault(require("@parcel/diagnostic"));

  _diagnostic = function () {
    return data;
  };

  return data;
}

function _nodeElmCompiler() {
  const data = _interopRequireDefault(require("node-elm-compiler"));

  _nodeElmCompiler = function () {
    return data;
  };

  return data;
}

function _elmHot() {
  const data = _interopRequireDefault(require("elm-hot"));

  _elmHot = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFixMe
// $FlowFixMe
let isWorker;

try {
  let worker_threads = require('worker_threads');

  isWorker = worker_threads.threadId > 0;
} catch (_) {
  isWorker = false;
}

var _default = new (_plugin().Transformer)({
  async loadConfig({
    config
  }) {
    const elmConfig = await config.getConfig(['elm.json']);

    if (!elmConfig) {
      elmBinaryPath(); // Check if elm is even installed

      throw new (_diagnostic().default)({
        diagnostic: {
          message: "The 'elm.json' file is missing.",
          hints: ["Initialize your elm project by running 'elm init'", "If you installed elm as project dependency then run 'yarn elm init' or 'npx elm init'"]
        }
      });
    }

    return elmConfig.contents;
  },

  async transform({
    asset,
    options
  }) {
    const elmBinary = elmBinaryPath();
    const compilerConfig = {
      spawn: _crossSpawn().default,
      cwd: _path().default.dirname(asset.filePath),
      // $FlowFixMe[sketchy-null-string]
      debug: !options.env.PARCEL_ELM_NO_DEBUG && options.mode !== 'production',
      optimize: asset.env.shouldOptimize
    };
    asset.invalidateOnEnvChange('PARCEL_ELM_NO_DEBUG');

    for (const filePath of await _nodeElmCompiler().default.findAllDependencies(asset.filePath)) {
      asset.invalidateOnFileChange(filePath);
    } // Workaround for `chdir` not working in workers
    // this can be removed after https://github.com/isaacs/node-graceful-fs/pull/200 was mergend and used in parcel
    // $FlowFixMe[method-unbinding]


    process.chdir.disabled = isWorker;

    try {
      let code = await compileToString(_nodeElmCompiler().default, elmBinary, asset, compilerConfig);

      if (options.hmrOptions) {
        code = _elmHot().default.inject(code);
      }

      if (compilerConfig.optimize) code = await minifyElmOutput(code);
      asset.type = 'js';
      asset.setCode(code);
    } catch (err) {
      if (options.mode === 'production') {
        throw err;
      }

      console.error(err.message);

      const errorPage = _path().default.join(__dirname, 'error-page.js');
      const codeBuf = await asset.fs.readFile(errorPage, 'utf-8');
      const errMessage = err.message.replaceAll('`', '\\`').replaceAll('Compiling ...', '');
      const code = codeBuf.toString().replaceAll('__error__message__', errMessage);

      asset.type = 'js';
      asset.setCode(code);
    }

    return [asset];
  }

});

exports.default = _default;

function elmBinaryPath() {
  let elmBinary = resolveLocalElmBinary();

  if (elmBinary == null && !_commandExists().default.sync('elm')) {
    throw new (_diagnostic().default)({
      diagnostic: {
        message: "Can't find 'elm' binary.",
        hints: ["You can add it as an dependency for your project by running 'yarn add -D elm' or 'npm add -D elm'", 'If you want to install it globally then follow instructions on https://elm-lang.org/'],
        origin: 'parcel-transformer-elm'
      }
    });
  }

  return elmBinary;
}

function resolveLocalElmBinary() {
  try {
    let result = require.resolve('elm/package.json'); // $FlowFixMe


    let pkg = require('elm/package.json');

    let bin = (0, _nullthrows().default)(pkg.bin);
    return _path().default.join(_path().default.dirname(result), typeof bin === 'string' ? bin : bin.elm);
  } catch (_) {
    return null;
  }
}

function compileToString(elm, elmBinary, asset, config) {
  return elm.compileToString(asset.filePath, {
    pathToElm: elmBinary,
    ...config
  });
}

let elmPureFuncs = ['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];

async function minifyElmOutput(source) {
  // Recommended minification
  // Based on: http://elm-lang.org/0.19.0/optimize
  let result = await (0, _terser().minify)(source, {
    compress: {
      keep_fargs: false,
      passes: 2,
      pure_funcs: elmPureFuncs,
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true
    },
    mangle: {
      reserved: elmPureFuncs
    }
  });
  if (result.code != null) return result.code;
  throw result.error;
}
