// fetch params in url for quick settings
import { updateTimer } from "./utils.mjs";

// Lecture du paramètre "duration" dans l'URL (en secondes)
const params = new URLSearchParams(globalThis.location.search);
const background = document.getElementById('expandingDiv');
const timer = document.getElementById('timer');
const startBtn = document.getElementById('start-pause');
const settingsForm = document.getElementById("settingsForm");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettings");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");
const showSettingsBtn = document.getElementById("showSettings");
const totalHeight = window.innerHeight;
let elapsed = 0;
let pause = true;
const pauseChar = '⏸️';
const playChar = '▶️'; 

const defaultSettings = {
  "durationInSeconds": 600,
  "showTimer": true,
  "colorScheme": "zenika-colors",
  "firstThreshold": 0.8,
  "secondThreshold": 0.9,
  "thirdThreshold": 0.95,
  "soundEnabled": false,
  "orientation": "upward"
}

let settings = {
  "durationInSeconds": parseDuration(params.get("duration")),
  "showTimer": true,
  "colorScheme": "zenika-colors",
  "firstThreshold": 0.8,
  "secondThreshold": 0.9,
  "thirdThreshold": 0.95,
  "soundEnabled": params.get("sound") === "true",
  "orientation": "upward"
}

let wakeLock = null;


// ------------- Settings ----------------

function parseDuration(durationStr) {
  const DEFAULT = 600; // 10 minutes by default
  if (!durationStr) return DEFAULT;

  durationStr = durationStr.toLowerCase().trim();
  let totalSeconds = 0;
  const regex = /(\d+)([ms:]?)/g;
  let match;
  let found = false;

  while ((match = regex.exec(durationStr)) !== null) {
    found = true;
    const value = Number.parseInt(match[1], 10);
    const unit = match[2] || "s";
    if (unit === "m" || unit === ":") {
      totalSeconds += value * 60;
    } else {
      totalSeconds += value;
    }
  }

  if (!found || totalSeconds <= 0) {
    console.warn(`Durée invalide ("${durationStr}"), utilisation de la valeur par défaut: ${DEFAULT}s`);
    return DEFAULT;
  }
  return totalSeconds;
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

  applySettings();
  hideSettings();
}

function applySettings() {
  timer.textContent = updateTimer(settings.durationInSeconds);
  document.documentElement.className = settings.colorScheme;

  if (settings.showTimer === false) {
    // maybe only hide the timer once it's started, but keep it visible until start to show the duration?
    timer.style.display = "none";
  } else {
    timer.style.display = "block";
  }

  updateSettingsForm();

  // Currently : apply changes to running timer. Maybe start the timer over?
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

// ------------- Animation ----------------
function getClassByProgress(p) {
  // p = percentage between 0 and 1
  if (p < settings.firstThreshold) return 'start';
  if (p < settings.secondThreshold) return 'critical';
  if (p < settings.thirdThreshold) return 'very-critical';
  return 'ending';
}

function switchPause() {
  pause = !pause;
  if (pause) {
    displayStart();
    pause = true
    timer.classList.add("blinking");
    timer.classList.add("pause");
    timer.setAttribute('title', "Click to continue");
  } else {
    startAnimation(performance.now() - elapsed)
    timer.classList.remove("blinking");
    timer.classList.remove("pause");
    timer.title = "Click to pause";
  }
}

function displayPause() {
  startBtn.innerHTML = pauseChar;
  startBtn.title = 'pause';
}

function displayStart() {
  startBtn.innerHTML = playChar;
  startBtn.title = 'start';
}

function updateBackground(progress) {
  const currentHeight = Math.floor(totalHeight * progress);
  background.style.height = `${currentHeight}px`;
  background.classList = getClassByProgress(progress);
}

function startAnimation(startTime = performance.now()) {
  requestWakeLock();
  displayPause();

  function animate(time, durationInSeconds = settings.durationInSeconds) {
    elapsed = time - startTime;
    const progress = Math.min(elapsed / (durationInSeconds * 1000), 1); // 0 → 1
    const remaining = durationInSeconds - (elapsed / 1000);
    timer.textContent = updateTimer(remaining);

    updateBackground(progress)

    if (pause) {
      return;
    } else if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      timer.textContent = "00:00";
      playBeep();
      timer.classList.add("blinking"); // démarre le clignotement

      // Arrête le clignotement après 5 secondes
      setTimeout(() => {
        timer.classList.remove("blinking");
        timer.style.opacity = "1";
      }, 5000);
    }
  }
  requestAnimationFrame(animate);
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock activé');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock relâché');
      });
    }
  } catch (err) {
    console.warn(`Impossible d'activer Wake Lock : ${err}`);
  }
}

function playBeep() {
  if (!settings.soundEnabled) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine"; // tone type: sine | square | triangle | sawtooth
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // frequency in Hz
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // volume

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3); // play for 0.3s
}


export function init() {
  // Wakelock: réactiver si la page revient au premier plan
  document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      requestWakeLock();
    }
  });


  showSettingsBtn.addEventListener('click', showSettings);
  closeSettingsBtn.addEventListener('click', hideSettings);
  resetBtn.addEventListener('click', resetDefaultSettings);
  submitBtn.addEventListener('click', submitSettings);
  startBtn.addEventListener('click', switchPause);
  displayStart();

  applySettings();
}

