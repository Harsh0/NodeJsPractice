'use strict';
const Enigma = require('./enigma');
const eng = new Enigma('magrathea');

let encodeString = eng.encode("Don't Panic!");
let decodeString = eng.decode(encodeString);
console.log('Encoded : ',encodeString);
console.log('Decoded : ',decodeString);
let qr = eng.qrgen(encodeString,'outImage.png');
console.log(qr?'QR code created':'QR creation failed');