[![npm version](https://badge.fury.io/js/layout-observer.svg)](https://badge.fury.io/js/layout-observer) [![Build Status](https://travis-ci.org/Aaronius/layout-observer.svg?branch=master)](https://travis-ci.org/Aaronius/layout-observer)

# Layout Observer

Layout Observer watches for a smattering of events and mutations and notifies you when it has detected something that may have affected the layout of a web page (something may have moved or changed size).

## Installation

`npm install --save layout-observer`

## Usage

```javascript
import LayoutObserver from 'layout-observer';

const observer = new LayoutObserver(() => console.log('layout change'));
observer.observe();
```

## API

### Constructor

##### `LayoutObserver(handler, options)`

`handler` The function that should be called each time a change has been detected.

`options` Options object which allows for the following properties:

`options.throttle` If set to a number greater than `0`, LayoutObserver will ensure that `handler` is invoked no more frequently than once every `throttle` milliseconds.

### Instance Methods

##### `observe()`

Begins observation.

##### `disconnect()`

Ends observation.

## Supported Browsers

Modern browsers. The latest Chrome, Firefox, Safari, and Edge, as well as IE 11+.

## Inspiration

[iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) was a fantastic resource for much of the event and mutation detection logic.

## License

MIT
