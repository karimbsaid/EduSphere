export const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case "7days":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0);
  }

  return { startDate, endDate: new Date() };
};
