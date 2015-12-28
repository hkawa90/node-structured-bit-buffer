var util = require('util');
var EventEmitter = require("events");

/**
 * BitBuffer Constructor
 * @constructs BitBuffer@ param {Buffer} buffer target buffer
 * @param {Buffer|String} buffer target buffer
 * @param {Number} offset offset bit number.if 0 is LSB.
 * @param {Number} bitsWidth width of bits.
 */
function BitBuffer(buffer, offset, bitsWidth) {
  if (buffer !== undefined) {
    if (typeof(buffer) === 'string') {
      debugger;
      var b = null;
      bitsWidth = buffer.length;
      offset = 0;
      b = new Buffer((((bitsWidth % 8) > 0) ? 1 : 0) + (bitsWidth >> 3));
      var start = bitsWidth - 8;
      var end = bitsWidth;
      for (var i = 0; i <= bitsWidth >> 3; i++) {
        var substringBits = buffer.substring(start, end);
        if (substringBits == '') {
          break;
        }
        b[i] = parseInt(substringBits, 2);
        start -= 8;
        end -= 8;
      }
      buffer = b;
    } else {
      if (offset === undefined) {
        offset = 0;
      }
      if (bitsWidth === undefined) {
        bitsWidth = buffer.length * 8;
      }
    }
  }
  Object.defineProperty(this, "buffer", {
    value: buffer || null,
    writable: true,
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(this, "offset", {
    value: offset || 0,
    writable: true,
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(this, "length", {
    value: bitsWidth || 0,
    writable: true,
    enumerable: true,
    configurable: true
  });
}

/**
 * Get bits
 *
 * @param {Number} offsetBits
 * @param {Number} bitsWidth
 * @returns {Number} Returns bits value
 */
BitBuffer.prototype.getBits = function(offsetBits, bitsWidth) {
  var r = 0;
  bitsWidth = (bitsWidth > this.length) ? this.length : bitsWidth;
  for (var o = offsetBits; o < offsetBits + bitsWidth; o++) {
    r = r | ((this.buffer[o >> 3] & (0x01 << (o % 8))) >> (offsetBits % 8));
  }
  return r;
}

/**
 * Get Bit
 *
 * @param {Number} offsetBit
 * @returns {Number} Returns specified bit value.
 */
BitBuffer.prototype.getBit = function(offsetBit) {
  return (this.buffer[offsetBit >> 3] >> (offsetBit % 8)) & 1;
}

/**
 * Set Bit
 *
 * @param {Number} offsetBit
 */
BitBuffer.prototype.setBit = function(offsetBit) {
  this.buffer[offsetBit >> 3] |= 1 << (offsetBit % 8);
}

/**
 * Set bits
 *
 * @param {Number} value set to value
 * @param {Number} offsetBits
 * @param {Number} bitsWidth
 * @returns {BitBuffer}
 */
BitBuffer.prototype.setBits = function(value, offsetBits, bitsWidth) {
  // number ^= (-x ^ number) & (1 << n);
  //clear number &= ~(1 << x);
  for (var o = this.offset; o < this.offset + this.length; o++) {
    this.buffer[o >> 3] &= ~(1 << (o % 8));
  }
  //set number |= 1 << x;
  for (var o = this.offset; o < this.offset + this.length; o++) {
    this.buffer[o >> 3] |= this.getBit(o - this.offset) << (o % 8);
  }
  return this;
}

/**
 * Convert to String
 *
 * @param {Number} radix
 * @returns {String} Returns converted strings
 */
BitBuffer.prototype.toString = function(radix) {
  var r = '';
  radix = radix || 2;
  if (radix != 2) {
    throw new Error('Unspported radix.');
  }
  debugger;
  for (var o = this.offset; o < this.offset + this.length; o++) {
    r += (((this.buffer[o >> 3] & (0x01 << (o % 8))) >> (this.offset % 8)) > 0) ? '1' : '0';
  }
  return r.split("").reverse().join("");;
}

/**
 * Bitwise and operation
 *
 * @param {BitBuffer|String} operand
 * @returns {BitBuffer} Return result.
 */
BitBuffer.prototype.and = function(operand) {
    var buffer = null;
    if (typeof(operand) === 'string') {
      buffer = this.parse(operand);
    } else {
      buffer = operand;
    }
    if (buffer.length !== this.length) {
      throw new Error('Bit width of Operand must be equal to this');
    }
    for (var i = 0; i < this.buffer.length; i++)
      buffer[i] &= operand[i];
    return this;
  }
  /**
   * Bitwise xor operation
   *
   * @param {BitBuffer|String} operand
   * @returns {BitBuffer} Return result.
   */
BitBuffer.prototype.xor = function(operand) {
  var b = null;
  if (typeof(operand) === 'string') {
    b = this.parse(operand);
  } else {
    b = operand;
  }
  if (b.length !== this.length) {
    throw new Error('Bit width of Operand must be equal to this');
  }
  for (var i = 0; i < this.buffer.length; i++) {
    this.buffer[i] ^= b.buffer[i];
  }
  return this;
}

/**
 * Bitwise not operation
 *
 * @returns  {BitBuffer} Return result.
 */
BitBuffer.prototype.not = function() {
  for (var i = 0; i < this.buffer.length; i++) {
    this.buffer[i] = ~this.buffer[i];
  }
  return this;
}

/**
 * Bitwise or operation
 *
 * @param  {BitBuffer|String} operand
 * @returns  {BitBuffer} Return result.
 */
BitBuffer.prototype.or = function(operand) {
  var b = null;
  if (typeof(operand) === 'string') {
    b = this.parse(operand);
  } else {
    b = operand;
  }
  if (b.length !== this.length) {
    throw new Error('Bit width of Operand must be equal to this');
  }
  for (var i = 0; i < this.buffer.length; i++) {
    this.buffer[i] |= b.buffer[i];
  }
  return this;
}

/**
 * Test bit value
 *
 * @param   {BitBuffer|String} operand
 * @returns {boolean}
 */
BitBuffer.prototype.equal = function(operand) {
  var b = null;
  var r = true;
  if (typeof(operand) === 'string') {
    b = this.parse(operand);
  } else {
    b = operand;
  }
  for (var i = 0; i < this.buffer.length; i++) {
    if (this.buffer[i] != b.buffer[i]) {
      r = false;
      break;
    }
  }
  return r;
}

/**
 * Bit Counter
 *
 * @param
 * @returns {Number} Return count bits.
 */
BitBuffer.prototype.count = function() {
  var count = 0;
  for (var o = 0; o < this.length; o++) {
    count += this.getBit(o);
  }
  return count;
}

/**
 * Reset all bit
 *
 * @param
 * @returns {BitBuffer} Return t
 */
BitBuffer.prototype.reset = function() {
  for (var i = 0; i < this.buffer.length; i++) {
    this.buffer[i] = 0;
  }
  return this;
}

/**
 * Any: All zero must be false.
 *
 * @param
 * @returns {boolean}
 */
BitBuffer.prototype.any = function() {
  var r = false;
  for (var o = 0; o < this.length; o++) {
    if (this.getBit(o) == 1) {
      r = true;
      break;
    }
  }
  return r;
}

/**
 * none: All zero must be true.
 *
 * @param
 * @returns {boolean} Return true if all bits is zero.
 */
BitBuffer.prototype.none = function() {
    return (!this.any());
  }
  /**
   * Bit Shift
   *
   * @param {Number} shitf_bit negative(positive) value is right(left) shift
   * @returns {BitBuffer} Return result.
   */
BitBuffer.prototype.shift = function(shift_bit) {
  // left shift
  var b = null;
  if (shift_bit > 0) {
    if ((this.buffer.length * 8) < (this.length + shift_bit + this.offset)) {
      // extension
      var bsize = (this.length + shift_bit + this.offset) >> 3;
      bsize += (((this.length + shift_bit + this.offset) % 8) > 0) ? 1 : 0;
      b = new Buffer(bsize);
    } else {
      b = new Buffer(this.buffer.length);
    }
    b.fill(0);
    for (var i = 0; i < bsize; i++) {
      b[i + (shift_bit >> 3)] |= this.buffer[i] << (shift_bit % 8);
    }
    this.length += shift_bit;
  } else { // right shift
    debugger;
    shift_bit = -shift_bit;
    if (this.length <= shift_bit) {
      this.buffer.fill(0);
      this.length = 1;
      b = this.buffer;
    } else {
      b = new Buffer(this.buffer.length);
      b.fill(0);
      for (var i = 0; i < b.length; i++) {
        if ((i - (shift_bit >> 3)) < 0) {
          continue;
        }
        console.log((i - (shift_bit >> 3)));
        b[i - (shift_bit >> 3)] |= this.buffer[i] >> (shift_bit % 8);
      }
      this.length -= shift_bit;
      if (this.length <= 0) {
        this.length = 1;
      }
    }
  }
  this.buffer = b;
  return this;
}

/**
 * Convert to ArrayBuffer
 *
 * @returns {ArrayBuffer} Return this as ArrayBuffer
 */
BitBuffer.prototype.toArrayBuffer = function() {
    var ab = new ArrayBuffer(this.buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < this.buffer.length; ++i) {
      view[i] = this.buffer[i];
    }
    return ab;
  }
  /**
   * convert from string to buffer;
   *
   * @param {String} bitString
   * @returns {BitBuffer|null}
   */
BitBuffer.prototype.parse = function(bitString) {
  var buffer = null;
  var bitsWidth, offset = 0;
  if (typeof(bitString) === 'string') {
    var b = null;
    bitsWidth = bitString.length;
    b = new Buffer((((bitsWidth % 8) > 0) ? 1 : 0) + (bitsWidth >> 3));
    var start = bitsWidth - 8;
    var end = bitsWidth;
    for (var i = 0; i <= bitsWidth >> 3; i++) {
      var substringBits = bitString.substring(start, end);
      if (substringBits == '') {
        break;
      }
      b[i] = parseInt(substringBits, 2);
      start -= 8;
      end -= 8;
    }
    return new BitBuffer(b, offset, bitsWidth);
  }
  return null;
}
module.exports.BitBuffer = BitBuffer;
//module.exports.StructuredBitBuffer = StructuredBitBuffer;
//module.exports.StructuredBitBufferStream = StructuredBitBufferStream;
