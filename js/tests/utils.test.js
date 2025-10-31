import { describe, it } from "node:test";
import assert from "node:assert";
import { updateTimer, updateBackground, parseDuration } from "../utils.mjs";

describe('Update timer', () => {
  describe('When remaining time is greater than 0', () => {
    [
      { timer: '00:00', time: 0 },
      { timer: '00:02', time: 2 },
      { timer: '01:01', time: 61 },
      { timer: '1440:01', time: 86401 }
    ].forEach(({ timer, time }) => {
      it(`with ${time} displays ${timer}`, () => {
        assert.equal(updateTimer(time), timer);
      })
    });
  });

  describe('When remaining time is less than 0', () => {
    [
      { timer: '00:00', time: -0 },
      { timer: '+00:02', time: -2 },
      { timer: '+01:01', time: -61 },
      { timer: '+1440:01', time: -86401 }
    ].forEach(({ timer, time }) => {
      it(`with ${time} displays ${timer}`, () => {
        assert.equal(updateTimer(time), timer);
      })
    });
  });
});

describe('updateBackground', () => {
  const background = {
    style: { height: 0 }, classList: { value: [] }
  }
  const settings = {
    firstThreshold: 0.3,
    secondThreshold: 0.6,
    thirdThreshold: 0.9
  };


  [
    { progress: 0.2, height: '20px', classe: 'start' },
    { progress: 0.5, height: '50px', classe: 'critical' },
    { progress: 0.8, height: '80px', classe: 'very-critical' },
    { progress: 0.95, height: '95px', classe: 'ending' }
  ].forEach(({ progress, height, classe }) => {
    it(`with a progress of ${progress}, it should update the background height to ${height} and pick class '${classe}'`, () => {

      updateBackground({ background, totalHeight: 100, progress, settings });
      assert.equal(background.style.height, height);
      assert.equal(background.classList.value.includes(classe), true);
    });
  });
});

describe('parseDuration', () => {
  describe('When there is no given duration', () => {
    it(`return default value`, () => {
      const duration = parseDuration();
      assert.equal(duration, 600);
    });
  });

  describe('When there is minutes only', () => {
    it(`When duration is equal to 0`, () => {
      it(`return default value`, () => {
        const duration = parseDuration('0m');
        assert.equal(duration, 600);
      });
    });

    it(`When duration is greater than 0`, () => {
      it(`return the parsed value`, () => {
        const duration = parseDuration('1m');
        assert.equal(duration, 60);
      });
    });
  });

  describe('When there is seconds only', () => {
    it(`When duration is equal to 0`, () => {
      it(`return default value`, () => {
        const duration = parseDuration('0s');
        assert.equal(duration, 600);
      });
    });

    it(`When duration is greater than 0`, () => {
      it(`return the parsed value`, () => {
        const duration = parseDuration('1s');
        assert.equal(duration, 1);
      });
    });
  });

  describe('When there are minutes and seconds only', () => {
    describe(`When duration is equal to 0`, () => {
      it(`return default value`, () => {
        const duration = parseDuration('0m0');
        assert.equal(duration, 600);
      });
    });

    describe(`When duration is greater than 0`, () => {
      describe(`When seconds suffix is given`, () => {
        it(`return the parsed value`, () => {
          const duration = parseDuration('61m12s');
          assert.equal(duration, 3672);
        });
      });

      describe(`When seconds suffix is not given`, () => {
        it(`return the parsed value`, () => {
          const duration = parseDuration('61m12');
          assert.equal(duration, 3672);
        });
      });

      describe(`When minutes are given after seconds`, () => {
        it(`return the parsed value`, () => {
          const duration = parseDuration('12s61m');
          assert.equal(duration, 3672);
        });
      });

      describe(`When : is used`, () => {
        it(`return the parsed value`, () => {
          const duration = parseDuration('61:12');
          assert.equal(duration, 3672);
        });
      });
    });
  });
});

