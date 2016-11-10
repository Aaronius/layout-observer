# Layout Observer

Layout Observer watches for a smattering of events and mutations and notifies you when it has detected something that may have affected the layout of a web page (something has moved or changed size).

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

##### `LayoutObserver()`

The function passed into the `LayoutObserver` constructor will be called each time a change has been detected.

### Instance Methods

##### `observe()`

Begins observation.

##### `disconnect()`

Ends observation.

## Supported Browsers

Modern browsers. The latest Chrome, Firefox, Safari, and Edge, as well as IE 11+.

## Inspiration

[iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) was a fantastic resource for much of the event and mutation detection logic.
