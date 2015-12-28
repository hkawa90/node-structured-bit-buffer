var expect = require("chai").expect;
var BitBuffer = require('../lib/node-structured-bit-buffer').BitBuffer;

describe("Structured Bit Buffer Module Test", function() {

  describe("Bit Buffer Test", function() {
    var bb = null;
    var buffer = null;
    beforeEach(function() {
      buffer = new Buffer(6);
      buffer.fill(0);
    });
    afterEach(function() {
      buffer = null;
      bb = null;
    });
    it("Constructor Test", function() {
      bb = new BitBuffer();
      expect(bb).to.be.an.instanceof(BitBuffer);
      expect(bb).to.have.property('buffer');
      expect(bb).to.have.property('offset');
      expect(bb).to.have.property('length');
      expect(bb.buffer).to.equal(null);
      expect(bb.offset).to.equal(0);
      expect(bb.length).to.equal(0);
      bb = new BitBuffer(buffer);
      expect(bb.buffer).to.equal(buffer);
      expect(bb.offset).to.equal(0);
      expect(bb.length).to.equal(buffer.length * 8);
      bb = new BitBuffer("1010");
      expect(bb.toString()).to.equal("1010");
      bb = new BitBuffer("10101");
      expect(bb.toString()).to.equal("10101");
      bb = new BitBuffer("1010101010101010");
      expect(bb.toString()).to.equal("1010101010101010");
      bb = new BitBuffer("10101010101010101");
      expect(bb.toString()).to.equal("10101010101010101");
      bb = new BitBuffer("10101010101010101010101010101010");
      expect(bb.toString()).to.equal("10101010101010101010101010101010");
      bb = new BitBuffer("101010101010101010101010101010101");
      expect(bb.toString()).to.equal("101010101010101010101010101010101");
      bb = new BitBuffer("1010101010101010101010101010101010101010101010101010101010101010");
      expect(bb.toString()).to.equal("1010101010101010101010101010101010101010101010101010101010101010");
      bb = new BitBuffer("10101010101010101010101010101010101010101010101010101010101010101");
      expect(bb.toString()).to.equal("10101010101010101010101010101010101010101010101010101010101010101");
    });
    it("toString method Test", function() {
      bb = new BitBuffer(buffer);
      expect(bb.toString()).to.equal("000000000000000000000000000000000000000000000000");
      buffer[0] = 0xff;
      expect(bb.toString()).to.equal("000000000000000000000000000000000000000011111111");
      for (var i = 0; i < 6; i++) {
        buffer[i] = 0xff;
      }
      expect(bb.toString()).to.equal("111111111111111111111111111111111111111111111111");
      expect(bb.toString.bind(20), Error, 'Unspported radix.');
      bb = new BitBuffer("101");
      expect(bb.toString()).to.equal("101");
    });
    it("getBit method Test", function() {
      bb = new BitBuffer(buffer);
      buffer[0] = parseInt('10101010', 2);
      expect(bb.getBit(0)).to.equal(0);
      expect(bb.getBit(1)).to.equal(1);
      expect(bb.getBit(2)).to.equal(0);
      expect(bb.getBit(3)).to.equal(1);
      expect(bb.getBit(4)).to.equal(0);
      expect(bb.getBit(5)).to.equal(1);
      expect(bb.getBit(6)).to.equal(0);
      expect(bb.getBit(7)).to.equal(1);
    });
    it("setBit method Test", function() {
      bb = new BitBuffer(buffer);
      bb.setBit(0);
      expect(buffer[0]).to.equal(1);
      bb.setBit(2);
      expect(buffer[0]).to.equal(5);
      bb.setBit(4);
      expect(buffer[0]).to.equal(21);
      bb.setBit(6);
      expect(buffer[0]).to.equal(85);
    });
    it("and method Test", function() {
      // no extension
      var b1 = new Buffer(1);
      var b2 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      var bb2 = new BitBuffer(b2);
      b1[0] = b2[1] = 0;
      expect(bb1.and(bb2).toString()).to.equal("00000000");
      b1[0] = b2[1] = 0xff;
      expect(bb1.and(bb2).toString()).to.equal("11111111");
      b1[0] = 0;
      b2[1] = 0xff;
      expect(bb1.and(bb2).toString()).to.equal("00000000");
      expect(bb1.and("11111111").toString()).to.equal("00000000");
      b1 = new Buffer(1);
      b2 = new Buffer(2);
      bb1 = new BitBuffer(b1);
      bb2 = new BitBuffer(b2);
      expect(bb1.and.bind(bb2), Error, 'Bit width of Operand must be equal to this');
    });
    it("xor method Test", function() {
      var b1 = new Buffer(1);
      var b2 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      var bb2 = new BitBuffer(b2);
      b1[0] = b2[0] = 0;
      expect(bb1.xor(bb2).toString()).to.equal("00000000");
      b1[0] = b2[0] = 0xff;
      expect(bb1.xor(bb2).toString()).to.equal("00000000");
      b1[0] = 0;
      b2[0] = 0xff;
      expect(bb1.xor(bb2).toString()).to.equal("11111111");
    });
    it("not method Test", function() {
      var b1 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      b1[0] = 0;
      expect(bb1.not().toString()).to.equal("11111111");
      b1[0] = 0xff;
      expect(bb1.not().toString()).to.equal("00000000");
      b1[0] = 170; // 10101010
      expect(bb1.not().toString()).to.equal("01010101");
    });
    it("or method Test", function() {
      var b1 = new Buffer(1);
      var b2 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      var bb2 = new BitBuffer(b2);
      b1[0] = b2[0] = 0;
      expect(bb1.or(bb2).toString()).to.equal("00000000");
      b1[0] = b2[0] = 0xff;
      expect(bb1.or(bb2).toString()).to.equal("11111111");
      b1[0] = 0;
      b2[0] = 0xff;
      expect(bb1.or(bb2).toString()).to.equal("11111111");
      b1[0] = 170; // 10101010
      b2[0] = 85; // 01010101
      expect(bb1.or(bb2).toString()).to.equal("11111111");
    });
    it("equal method Test", function() {
      var b1 = new Buffer(1);
      var b2 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      var bb2 = new BitBuffer(b2);
      b1[0] = b2[0] = 0;
      expect(bb1.equal(bb2)).to.be.true;
      b1[0] = b2[0] = 0xff;
      expect(bb1.equal(bb2)).to.be.true;;
      b1[0] = 0;
      b2[0] = 0xff;
      expect(bb1.equal(bb2)).to.be.false;
    });
    it("reset method Test", function() {
      var b1 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      b1[0] = 0;
      expect(bb1.reset().toString()).to.equal("00000000");
      b1[0] = 0xff;
      expect(bb1.reset().toString()).to.equal("00000000");
      b1[0] = 170; // 10101010
      expect(bb1.reset().toString()).to.equal("00000000");
    });
    it("any method Test", function() {
      var b1 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      b1[0] = 0;
      expect(bb1.any()).to.be.false;
      b1[0] = 0xff;
      expect(bb1.any()).to.be.true;
      b1[0] = 170; // 10101010
      expect(bb1.any()).to.be.true;
    });
    it("count method Test", function() {
      var b1 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      b1[0] = 0;
      expect(bb1.count()).to.equal(0);
      b1[0] = 0xff;
      expect(bb1.count()).to.equal(8);
      b1[0] = 170; // 10101010
      expect(bb1.count()).to.equal(4);
    });
    it("none method Test", function() {
      var b1 = new Buffer(1);
      var bb1 = new BitBuffer(b1);
      b1[0] = 0;
      expect(bb1.none()).to.be.true;
      b1[0] = 0xff;
      expect(bb1.none()).to.be.false;
      b1[0] = 170; // 10101010
      expect(bb1.none()).to.be.false;
    });
    it("shift method Test", function() {
      var bb1 = new BitBuffer("1");
      expect(bb1.shift(8).toString()).to.equal("100000000");
      bb1 = new BitBuffer("1");
      expect(bb1.shift(-8).toString()).to.equal("0");
    });
    // it("getBits method Test", function() {});
    // it("setBits method Test", function() {});
  });
  describe("Structured Bit Buffer Test", function() {});
  describe("Structured Bit Buffer Stream Test", function() {});
});
