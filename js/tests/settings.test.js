import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { initSettings, showSettings, hideSettings, submitSettings, updateSettingsForm } from "../settings.mjs";


describe('initSettings', () => {
    it(`Should create settings with given parameters`, () => {
        const settings = initSettings({ durationInSeconds: 20, soundEnabled: true });

        assert.deepEqual(settings, {
            colorScheme: 'zenika-colors',
            durationInSeconds: 20,
            firstThreshold: 0.8,
            orientation: 'upward',
            secondThreshold: 0.9,
            showTimer: true,
            soundEnabled: true,
            thirdThreshold: 0.95,
        });
    });
});


describe('showSettings', () => {
    it(`Should open the modal`, () => {
        const settingsModalElement = { showModal: mock.fn(), close: mock.fn() };
        initSettings({ settingsModalElement });

        showSettings();

        assert.equal(settingsModalElement.showModal.mock.callCount(), 1);
        assert.equal(settingsModalElement.close.mock.callCount(), 0);
    });
});

describe('hideSettings', () => {
    it(`Should close the modal`, () => {
        const settingsModalElement = { showModal: mock.fn(), close: mock.fn() };
        initSettings({ settingsModalElement });

        hideSettings();

        assert.equal(settingsModalElement.showModal.mock.callCount(), 0);
        assert.equal(settingsModalElement.close.mock.callCount(), 1);
    });
});

describe('submitSettings', () => {

    const settingsFormElement = {
        ["color-scheme"]: { value: 'zenika-other-colors' },
        ["threshold1"]: { value: 10 },
        ["threshold2"]: { value: 20 },
        ["threshold3"]: { value: 30 },
        durationMinutes: { value: 1 },
        durationSeconds: { value: 1 },
        orientation: { value: 'downward' },
        ["show-timer"]: { checked: false },
        ["play-sound"]: { checked: false },
    };

    it(`Should close the modal`, () => {
        const settingsModalElement = { showModal: mock.fn(), close: mock.fn() };
        initSettings({ settingsModalElement, settingsFormElement });

        submitSettings();

        assert.equal(settingsModalElement.close.mock.callCount(), 1);
    });

    it(`Should update the settings with the given form`, () => {
        const settingsModalElement = { showModal: mock.fn(), close: mock.fn() };
        const settings = initSettings({ settingsModalElement, settingsFormElement });

        submitSettings();

        assert.deepEqual(settings, {
            colorScheme: 'zenika-other-colors',
            durationInSeconds: 61,
            firstThreshold: 0.1,
            secondThreshold: 0.2,
            thirdThreshold: 0.3,
            orientation: 'downward',
            showTimer: false,
            soundEnabled: false,
        });
    });
});


describe('updateSettingsForm', () => {
    const settingsFormElement = {
        ["color-scheme"]: { value: undefined },
        ["threshold1"]: { value: undefined },
        ["threshold2"]: { value: undefined },
        ["threshold3"]: { value: undefined },
        durationMinutes: { value: undefined },
        durationSeconds: { value: undefined },
        orientation: { value: undefined },
        ["show-timer"]: { checked: undefined },
        ["play-sound"]: { checked: undefined },
    };

    it(`Should update the form with the given settings`, () => {
        const settingsModalElement = { showModal: mock.fn(), close: mock.fn() };
        initSettings({ settingsModalElement, settingsFormElement, soundEnabled: true, durationInSeconds: 123 });

        updateSettingsForm();

        assert.deepEqual(settingsFormElement, {
            ["color-scheme"]: { value: 'zenika-colors' },
            ["threshold1"]: { value: 80 },
            ["threshold2"]: { value: 90 },
            ["threshold3"]: { value: 95 },
            durationMinutes: { value: 2 },
            durationSeconds: { value: 3 },
            orientation: { value: 'upward' },
            ["show-timer"]: { checked: true },
            ["play-sound"]: { checked: true },
        });
    });
});
