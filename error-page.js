const body = document.body;

while (body.firstChild) {
  body.firstChild.remove();
}

const styles = document.createElement('style');
styles.appendChild(document.createTextNode(`
.errors-block {
  margin: 2em;
}
`));

const errorsBlock = document.createElement('div');

errorsBlock.classList.add('errors-block');

`__error__`.split('\n').forEach(line => {
  const errorLine = document.createElement('p');

  errorLine.appendChild(document.createTextNode(line));
  errorsBlock.appendChild(errorLine);
});

body.appendChild(styles);
body.appendChild(errorsBlock);

const noop = () => {};

const ports = new Proxy({}, {
  get(target, prop, receiver) {
    return {
      send: noop,
      subscribe: noop,
    };
  }
});

const initElmApp = name => {
  console.log(`Someone is trying to run "${name}" Elm app, but the bundle is currently broken`);

  return { ports };
};

this.Elm = new Proxy({}, {
  get(target, prop, receiver) {
    return {
      init: () => initElmApp(prop),
    };
  }
});
