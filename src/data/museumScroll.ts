export const ROOM_SCROLL_WEIGHTS = [1, 1, 4, 1];

export const TOTAL_ROOM_SCROLL_WEIGHT = ROOM_SCROLL_WEIGHTS.reduce(
  (total, weight) => total + weight,
  0,
);

export const LETTER_SCROLL_START_WEIGHT = ROOM_SCROLL_WEIGHTS
  .slice(0, -1)
  .reduce((total, weight) => total + weight, 0);
