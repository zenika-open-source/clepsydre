export function updateTimer(secRemaining) {
  const sec = Math.abs(Math.ceil(secRemaining));
  const minutes = Math.floor(sec / 60);
  const remainingSeconds = sec % 60;
  // format into "mm:ss" padded with 0 if needed
  return `${secRemaining < 0 ? '+' : ''}${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function updateBackground({ background, totalHeight, progress, settings }) {
  const currentHeight = Math.floor(totalHeight * progress);
  background.style.height = `${currentHeight}px`;
  background.classList.value = [getClassByProgress(progress, settings)];
}

export function parseDuration(durationStr) {
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

function getClassByProgress(p, settings) {
  // p = percentage between 0 and 1
  if (p < settings.firstThreshold) return 'start';
  if (p < settings.secondThreshold) return 'critical';
  if (p < settings.thirdThreshold) return 'very-critical';
  return 'ending';
}
