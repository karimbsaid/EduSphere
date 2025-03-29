/* eslint-disable react/prop-types */
const ProgressBar = ({ myAvance, total = 100 }) => {
  const percentage = Math.min((myAvance / total) * 100, 100).toFixed(2); // Assurez que le pourcentage ne dépasse pas 100

  return (
    <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700 mr-5">
      <div
        className="bg-green-400 h-1 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
