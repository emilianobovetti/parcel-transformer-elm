const OVERLAY_ID = '__parcel__error__overlay__';

let overlay = document.getElementById(OVERLAY_ID);

if (overlay) {
  overlay.remove();
}

overlay = document.createElement('div');
overlay.id = OVERLAY_ID;

overlay.innerHTML = `<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999; overflow: auto;">
  <div>
    <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
      🚨 Elm Compiler Error
    </div>
    <pre>__error__message__</pre>
  </div>
</div>
`;

document.body.appendChild(overlay);

const noop = () => {};

const ports = new Proxy({}, {
  get(target, prop, receiver) {
    return {
      send: noop,
      subscribe: noop
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
      init: () => initElmApp(prop)
    };
  }
});
