// fetch params in url for quick settings
import { updateBackground, updateTimer, parseDuration } from "./utils.mjs";
import { showSettings, hideSettings, submitSettings, resetDefaultSettings, initSettings } from "./settings.mjs";

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

let wakeLock = null;

// ------------- Animation ----------------
function switchPause(settings) {
  pause = !pause;
  if (pause) {
    displayStart();
    pause = true
    timer.classList.add("blinking");
    timer.classList.add("pause");
    timer.setAttribute('title', "Click to continue");
  } else {
    startAnimation(performance.now() - elapsed, settings)
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



function startAnimation(startTime = performance.now(), settings) {
  requestWakeLock();
  displayPause();
  const { durationInSeconds } = settings;

  function animate(time) {
    elapsed = time - startTime;
    const progress = Math.min(elapsed / (durationInSeconds * 1000), 1); // 0 → 1
    const remaining = durationInSeconds - (elapsed / 1000);
    timer.textContent = updateTimer(remaining);

    updateBackground({ background, totalHeight, progress, settings })

    if (pause) {
      return;
    } else if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (settings.overtime) {
        requestAnimationFrame(animate);
      } else {
        timer.textContent = "00:00";
        playBeep(settings);
        timer.classList.add("blinking"); // démarre le clignotement

        // Arrête le clignotement après 5 secondes
        setTimeout(() => {
          timer.classList.remove("blinking");
          timer.style.opacity = "1";
        }, 5000);
      }
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

function playBeep(settings) {
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

function applySettings(settings, timer) {
  timer.textContent = updateTimer(settings.durationInSeconds);
  document.documentElement.className = settings.colorScheme;

  if (settings.showTimer === false) {
    // maybe only hide the timer once it's started, but keep it visible until start to show the duration?
    timer.style.display = "none";
  } else {
    timer.style.display = "block";
  }
}


export function init() {
  const settings = initSettings({
    durationInSeconds: parseDuration(params.get("duration")), soundEnabled: params.get("sound") === "true", settingsModalElement: settingsModal, settingsFormElement: settingsForm
  });
  // Wakelock: réactiver si la page revient au premier plan
  document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      requestWakeLock();
    }
  });

  showSettingsBtn.addEventListener('click', showSettings);
  closeSettingsBtn.addEventListener('click', hideSettings);
  resetBtn.addEventListener('click', resetDefaultSettings);
  submitBtn.addEventListener('click', () => {
    submitSettings(settingsForm)
    applySettings(settings, timer);
  });
  startBtn.addEventListener('click', () => switchPause(settings));

  displayStart();
  applySettings(settings, timer);
}
