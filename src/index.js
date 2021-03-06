// List of events that could potentially change layout without triggering a mutation observer.
// Inspired by https://github.com/davidjbradshaw/iframe-resizer/blob/86daa57745f630385e3eb6b03af02dac49d8b777/src/iframeResizer.contentWindow.js#L291-L310
const EVENT_TYPES = [
  'resize',
  'animationstart',
  'webkitAnimationStart',
  'animationiteration',
  'webkitAnimationIteration',
  'animationend',
  'webkitAnimationEnd',
  'input',
  'mouseup',
  'mousedown',
  'orientationchange',
  'afterprint',
  'beforeprint',
  'readystatechange',
  'touchstart',
  'touchend',
  'touchcancel',
  'transitionstart',
  'webkitTransitionStart',
  'MSTransitionStart',
  'oTransitionStart',
  'otransitionstart',
  'transitioniteration',
  'webkitTransitionIteration',
  'MSTransitionIteration',
  'oTransitionIteration',
  'otransitioniteration',
  'transitionend',
  'webkitTransitionEnd',
  'MSTransitionEnd',
  'oTransitionEnd',
  'otransitionend'
];

// Derived from http://stackoverflow.com/a/27078401/459966 which is derived from underscore.
// This differs from the one in stackoverflow because it's optimized by removing the options object
// and always assuming the defaults.
const throttle = (func, wait) => {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  var later = function() {
    previous = Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

const masterObserver = (() => {
  let observing = false;
  const connectedHandlers = [];

  const callHandlers = function() {
    connectedHandlers.forEach(handler => {
      handler();
    });
  };

  const mutationObserver = new MutationObserver(callHandlers);

  const loadHandler = function(event) {
    const target = event.target;
    if (target.tagName === 'IMG') {
      callHandlers();
    }
  };

  const hasDOMContentLoaded = () =>
    document.readyState === 'interactive' || document.readyState === 'complete';

  const startObservations = () => {
    mutationObserver.observe(document.body, {
      attributes: true,
      attributeOldValue: false,
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true
    });

    EVENT_TYPES.forEach(eventType => {
      window.addEventListener(eventType, callHandlers);
    });

    // Watch for images and similar resources to load. Load events don't bubble so we must
    // use capture. We can't add the event listener to body because "For legacy reasons, load
    // events for resources inside the document (e.g., images) do not include the Window in the
    // propagation path in HTML implementations"
    document.body.addEventListener('load', loadHandler, true);
  };

  const domContentLoadedHandler = () => {
    startObservations();
    callHandlers();
  };

  const observe = function() {
    if (!observing) {
      observing = true;

      if (hasDOMContentLoaded()) {
        startObservations();
      } else {
        // When the DOM content has loaded, we can start observations because we have access to
        // the necessary DOM element
        document.addEventListener('DOMContentLoaded', domContentLoadedHandler);
      }
    }
  };

  const disconnect = () => {
    if (observing) {
      observing = false;

      mutationObserver.disconnect();

      document.removeEventListener('DOMContentLoaded', domContentLoadedHandler);

      EVENT_TYPES.forEach(eventType => {
        window.removeEventListener(eventType, callHandlers);
      });

      if (document.body) { // In case disconnect is called before DOMContentLoaded.
        document.body.removeEventListener('load', loadHandler, true);
      }
    }
  };

  return {
    connectHandler(handler) {
      if (connectedHandlers.indexOf(handler) === -1) {
        connectedHandlers.push(handler);
      }

      observe();
    },
    disconnectHandler(handler) {
      const index = connectedHandlers.indexOf(handler);

      if (index !== -1) {
        connectedHandlers.splice(index, 1);

        if (!connectedHandlers.length) {
          disconnect();
        }
      }
    }
  };
})();

const LayoutObserver = function(handler, options) {
  if (options && options.throttle) {
    this.handler = throttle(handler, options.throttle);
  } else {
    this.handler = handler;
  }
};

LayoutObserver.prototype.observe = function() {
  masterObserver.connectHandler(this.handler);
};

LayoutObserver.prototype.disconnect = function() {
  masterObserver.disconnectHandler(this.handler);
};

export default LayoutObserver;
