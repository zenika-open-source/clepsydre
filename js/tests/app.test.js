import { describe, it } from "node:test";
import assert from "node:assert";
import { updateTimer } from "../utils.mjs";

describe('Update timer', () => {
  [
    { timer: '00:00', time: 0 },
    { timer: '00:02', time: 2 },
    { timer: '01:01', time: 61 },
    { timer: '1440:01', time: 86401 }
  ].forEach(({ timer, time }) => {
    it(`with ${time} displays ${timer}`, () => {
      assert.equal(updateTimer(time), timer);
    })
  })
});