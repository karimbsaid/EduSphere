export const deepDiff = (original, modified) => {
  const result = {};

  for (const key in modified) {
    const originalVal = original[key];
    const modifiedVal = modified[key];

    // Check if the value is an object or array
    const isObject =
      typeof modifiedVal === "object" &&
      modifiedVal !== null &&
      !Array.isArray(modifiedVal);

    if (isObject) {
      const nestedDiff = deepDiff(originalVal || {}, modifiedVal);
      if (Object.keys(nestedDiff).length > 0) {
        result[key] = nestedDiff;
      }
    } else if (Array.isArray(modifiedVal)) {
      if (
        !Array.isArray(originalVal) ||
        JSON.stringify(originalVal) !== JSON.stringify(modifiedVal)
      ) {
        result[key] = modifiedVal;
      }
    } else if (modifiedVal !== originalVal) {
      result[key] = modifiedVal;
    }
  }

  return result;
};
