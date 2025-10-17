export function updateTimer(secRemaining) {
  const sec = Math.max(0, Math.ceil(secRemaining));
  const minutes = Math.floor(sec / 60);
  const remainingSeconds = sec % 60;
  // format into "mm:ss" padded with 0 if needed
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}