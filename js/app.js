// Lecture du paramètre "duration" dans l'URL (en secondes)
const params = new URLSearchParams(globalThis.location.search);
const durationParam = params.get("duration"); // ex: "2m30s", par défaut 10m
const durationInSeconds = parseDuration(durationParam);

const div = document.getElementById('expandingDiv');
const timer = document.getElementById('timer');
const startMessage = document.getElementById('startMessage');

const totalHeight = window.innerHeight;



let wakeLock = null;

function parseDuration(durationStr) {
  const DEFAULT = 600; // par défaut 10 minutes
  if (!durationStr) return DEFAULT;

  durationStr = durationStr.toLowerCase().trim();
  let totalSeconds = 0;
  const regex = /(\d+)([ms]?)/g;
  let match;
  let found = false;

  while ((match = regex.exec(durationStr)) !== null) {
    found = true;
    const value = Number.parseInt(match[1], 10);
    const unit = match[2] || "s";
    if (unit === "m") {
      totalSeconds += value * 60;
    } else {
      totalSeconds += value;
    }
  }

  if (!found || totalSeconds <= 0) {
    console.warn(`Durée invalide ("${durationStr}"), utilisation de la valeur par défaut: ${DEFAULT}m`);
    return DEFAULT;
  }
  return totalSeconds;
}


function updateTimer(secRemaining) {
  const sec = Math.max(0, Math.ceil(secRemaining));
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getClassByProgress(p) {
  // p = pourcentage entre 0 et 1
  if (p < 0.8) return 'start';
  if (p < 0.9) return 'critical';
  if (p < 0.95) return 'very-critical';
  return 'ending';
}

function startAnimation() {
  requestWakeLock();
  startMessage.style.opacity = 0;
  setTimeout(() => startMessage.style.display = 'none', 600);

  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / (durationInSeconds * 1000), 1); // 0 → 1
    const currentHeight = Math.floor(totalHeight * progress);
    const remaining = durationInSeconds - (elapsed / 1000);
    updateTimer(remaining);

    div.style.height = `${currentHeight}px`;
    div.classList = getClassByProgress(progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      timer.textContent = "00:00";
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

// --- Démarrage au clic ---
function onFirstClick() {
  startAnimation();
  document.removeEventListener('click', onFirstClick);
}
document.addEventListener('click', onFirstClick);

// Wakelock: réactiver si la page revient au premier plan
document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

// Affiche la durée totale avant démarrage
updateTimer(durationInSeconds);
