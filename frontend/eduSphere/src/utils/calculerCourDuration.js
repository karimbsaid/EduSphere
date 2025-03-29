export const calculateDuration = (course) => {
  let totalDuration = 0;

  for (const section of course) {
    for (const lecture of section.lectures) {
      totalDuration += lecture.duration || 0;
    }
  }
};
