import LayoutObserver from '../src/index';

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

const dispatchEvent = (target, eventType) => {
  const event = document.createEvent('CustomEvent');
  event.initEvent(eventType, true, true);
  target.dispatchEvent(event);
};

describe('Layout Observer', () => {
  let spy;
  let observer;

  beforeEach(() => {
    spy = jasmine.createSpy();
    observer = new LayoutObserver(spy);
    observer.observe();
  });

  afterEach(() => {
    observer.disconnect();
  });

  // Note that if this test is disabled, then the other tests won't function correctly.
  // This test waits for DOMContentLoaded which forces all other tests to run after
  // DOMContentLoaded. If this test is disabled, the spies for the observers in the other
  // tests won't see any layout changes because they'll run before DOMContentLoaded and the layout
  // observer doesn't call any handlers until DOMContentLoaded.
  it('notifies observer on DOMContentLoaded', (done) => {
    expect(spy).not.toHaveBeenCalled();

    document.addEventListener('DOMContentLoaded', () => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('notifies observer on events', () => {
    EVENT_TYPES.forEach(eventType => {
      dispatchEvent(window, eventType);
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();
    });
  });

  it('notifies observer when a DOM element is added', (done) => {
    document.body.appendChild(document.createElement('div'));

    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('notifies observer when a DOM attribute is set', done => {
    document.body.setAttribute('data-test', 'foo');

    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('notifies observer when innerHTML is set', done => {
    const contentDiv = document.createElement('div');
    document.body.appendChild(contentDiv);

    setTimeout(() => {
      spy.calls.reset();

      contentDiv.innerHTML = 'foo';

      setTimeout(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });
  });

  it('notifies observer when an image finishes loading', done => {
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    document.body.appendChild(img);

    document.body.addEventListener('load', () => {
      expect(spy).toHaveBeenCalled();
      done();
    }, true);
  });


  it('notifies only and all connected observers', () => {
    const spy1 = jasmine.createSpy();
    const observer1 = new LayoutObserver(spy1);
    const spy2 = jasmine.createSpy();
    const observer2 = new LayoutObserver(spy2);

    dispatchEvent(window, 'mousedown');

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    observer1.observe();
    observer2.observe();

    dispatchEvent(window, 'mousedown');

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    spy1.calls.reset();
    spy2.calls.reset();

    observer2.disconnect();

    dispatchEvent(window, 'mousedown');

    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    spy1.calls.reset();
    spy2.calls.reset();

    observer1.disconnect();

    dispatchEvent(window, 'mousedown');

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  describe('throttling', () => {
    const THROTTLE_DELAY = 100;

    beforeEach(() => {
      jasmine.clock().mockDate(new Date());
      jasmine.clock().install();
      spy = jasmine.createSpy();
      observer = new LayoutObserver(spy, { throttle: THROTTLE_DELAY });
      observer.observe();
    });

    afterEach(() => {
      observer.disconnect();
      jasmine.clock().uninstall();
    });

    it('should throttle handler calls', () => {
      for(let i = 0; i < 500; i++) {
        dispatchEvent(window, 'mousedown');
      }

      jasmine.clock().tick(THROTTLE_DELAY);

      // Called once at the beginning, and once at the end
      expect(spy.calls.count()).toBe(2);

      for(let i = 0; i < 500; i++) {
        dispatchEvent(window, 'mousedown');
      }

      jasmine.clock().tick(THROTTLE_DELAY);

      // ...and called once more after another delay period.
      expect(spy.calls.count()).toBe(3);
    });
  });
});
