import 'core-js/es6/map';
import 'core-js/es6/set';

global.requestAnimationFrame =
  (typeof window === 'object' && window.requestAnimationFrame) ||
  function(callback) {
    setTimeout(callback, 0);
  };
