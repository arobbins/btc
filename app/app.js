// import bitcoin from 'bitcoinjs-lib';
import Rx from 'rx';
import 'rx-dom';
import $ from 'jquery';




const toBtc = function(satoshi) {
  return satoshi / 100000000;
}



/*
  Defining the next and error callbacks of our Observable
*/
const openObs = Rx.Observer.create(e => {
  console.info('socket open');
  socket.onNext('{"op":"unconfirmed_sub"}');
});

const closeObs = Rx.Observer.create(() => {
  console.log('socket is about to close');
});


/*
  fromWebSocket takes two callbacks:
    1. WS Open
    2. WS Close
*/
const socket = Rx.DOM.fromWebSocket('wss://ws.blockchain.info/inv', null, openObs, closeObs);


/*
  subscribe() takes three callbacks
    1) onNext
    2) onError
    3) onComplete
*/
socket.subscribe(success => {

  let data = JSON.parse(success.data),
      btc = toBtc(data.x.out[0].value),
      $el = $('<div class="tx-wrapper animated bounceInDown"><p class="tx animated zoomOutRight">' + btc + '</p></div>');

    $('.component-tx').prepend($el);

    setTimeout(() => {
      $el.remove();
    }, 3000);


  }, error => {
    console.error('error: %s', e);

  }, () => {
    console.info('socket closed');

  }
);
