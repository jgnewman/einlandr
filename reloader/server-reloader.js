let needsReload = true;
let isRefreshing = true;

export function shouldReload() {
  return needsReload && !isRefreshing;
}

export function prepReload() {
  needsReload = true;
}

export function unprepReload() {
  needsReload = false;
}

export function markRefreshing() {
  isRefreshing = true;
}

export function finishRefreshing() {
  isRefreshing = false;
}
