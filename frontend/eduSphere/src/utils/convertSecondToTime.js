export const convertSecondToTime = (second) => {
  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second % 3600) / 60);
  const seconds = second % 60; // Pas besoin de `% 3600`, il reste déjà dans la plage de 60

  return { hours, minutes, seconds };
};
