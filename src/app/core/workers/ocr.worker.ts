/// <reference lib="webworker" />

addEventListener('message', () => {
  postMessage({ status: 'placeholder' });
});
