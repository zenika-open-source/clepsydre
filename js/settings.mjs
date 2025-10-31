const defaultSettings = {
    durationInSeconds: 600,
    showTimer: true,
    colorScheme: "zenika-colors",
    firstThreshold: 0.8,
    secondThreshold: 0.9,
    thirdThreshold: 0.95,
    soundEnabled: false,
    orientation: "upward"
}

let settings;
let settingsModal;
let settingsForm;

function initSettings({ durationInSeconds, soundEnabled, settingsModalElement, settingsFormElement }) {
    settingsModal = settingsModalElement;
    settingsForm = settingsFormElement;
    settings = { ...defaultSettings, durationInSeconds, soundEnabled }
    return settings;
}

function showSettings() {
    settingsModal.showModal();
}

function hideSettings() {
    settingsModal.close();
}

function submitSettings() {
    settings.durationInSeconds = Number(settingsForm["durationMinutes"].value * 60) + Number(settingsForm["durationSeconds"].value)
    settings.colorScheme = settingsForm["color-scheme"].value;
    settings.showTimer = settingsForm["show-timer"].checked;
    settings.firstThreshold = settingsForm["threshold1"].value / 100;
    settings.secondThreshold = settingsForm["threshold2"].value / 100;
    settings.thirdThreshold = settingsForm["threshold3"].value / 100;
    settings.soundEnabled = settingsForm["play-sound"].checked;
    settings.orientation = settingsForm["orientation"].value;

    hideSettings();
}


function updateSettingsForm() {
    // Apply the settings to the form so it reflects current settings
    settingsForm["durationMinutes"].value = Math.floor(settings.durationInSeconds / 60);
    settingsForm["durationSeconds"].value = settings.durationInSeconds % 60;
    settingsForm["show-timer"].checked = settings.showTimer;
    settingsForm["color-scheme"].value = settings.colorScheme;
    settingsForm["threshold1"].value = settings.firstThreshold * 100;
    settingsForm["threshold2"].value = settings.secondThreshold * 100;
    settingsForm["threshold3"].value = settings.thirdThreshold * 100;
    settingsForm["play-sound"].checked = settings.soundEnabled;
    settingsForm["orientation"].value = settings.orientation;
}

function resetDefaultSettings() {
    settings = defaultSettings;
    updateSettingsForm();
}

export { showSettings, hideSettings, submitSettings, updateSettingsForm, resetDefaultSettings, initSettings }