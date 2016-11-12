import LayoutObserver from '../src/index';

const EVENT_TYPES = [
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

  it('notifies observer on DOMContentLoaded', (done) => {
    expect(spy).not.toHaveBeenCalled();

    document.addEventListener('DOMContentLoaded', () => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('notifies observer on events', () => {
    EVENT_TYPES.forEach(eventType => {
      window.dispatchEvent(new Event(eventType));
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
    // I would typically use an image that karma hosts, but when I try to do so, in Firefox I get
    // an "illegal character" message despite trying various images and image types.
    img.src = 'http://placehold.it/350x150';
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

    window.dispatchEvent(new Event('mousedown'));

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    observer1.observe();
    observer2.observe();

    window.dispatchEvent(new Event('mousedown'));

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    spy1.calls.reset();
    spy2.calls.reset();

    observer2.disconnect();

    window.dispatchEvent(new Event('mousedown'));

    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    spy1.calls.reset();
    spy2.calls.reset();

    observer1.disconnect();

    window.dispatchEvent(new Event('mousedown'));

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });
});
