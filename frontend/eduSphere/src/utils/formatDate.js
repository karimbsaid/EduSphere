export const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() retourne 0-11
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
