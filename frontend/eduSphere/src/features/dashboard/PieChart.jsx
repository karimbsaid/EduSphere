// Custom legend component
const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload.map((entry, index) => {
        const percentage = ((entry.payload[dataKey] / total) * 100).toFixed(1);
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 font-medium">
              {entry.payload[nameKey]}
            </span>
            <span className="text-gray-500">({percentage}%)</span>
          </div>
        );
      })}
    </div>
  );
};
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Modern color palette with gradients and better contrast
const COLORS = [
  "#667eea", // Purple-blue
  "#764ba2", // Deep purple
  "#f093fb", // Light pink
  "#f5576c", // Coral red
  "#4facfe", // Sky blue
  "#00f2fe", // Cyan
  "#43e97b", // Green
  "#38f9d7", // Turquoise
  "#ffecd2", // Cream
  "#fcb69f", // Peach
];

// Enhanced gradient colors for better visual appeal
const GRADIENT_COLORS = [
  { start: "#667eea", end: "#764ba2" },
  { start: "#f093fb", end: "#f5576c" },
  { start: "#4facfe", end: "#00f2fe" },
  { start: "#43e97b", end: "#38f9d7" },
  { start: "#ffecd2", end: "#fcb69f" },
  { start: "#a8edea", end: "#fed6e3" },
  { start: "#ff9a9e", end: "#fecfef" },
  { start: "#fecfef", end: "#fecfef" },
];

const PieChartCustom = ({
  data = [],
  dataKey = "value",
  nameKey = "name",
  title = "Market Distribution Analysis",
  showPercentage = true,
  animate = true,
}) => {
  // Calculate total for percentage display
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data[dataKey] / total) * 100).toFixed(1);

      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value:{" "}
            <span className="font-medium text-gray-800">{data[dataKey]}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage:{" "}
            <span className="font-medium text-gray-800">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium drop-shadow-sm"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : name}
      </text>
    );
  };

  // Custom legend component
  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry, index) => {
          const percentage = ((entry.payload[dataKey] / total) * 100).toFixed(
            1
          );
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 font-medium">
                {entry.payload[nameKey]}
              </span>
              <span className="text-gray-500">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white to-gray-50 border border-gray-100">
      {/* Header with enhanced styling */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
      </div>

      {/* Chart container with improved responsive design */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            {/* Define gradients */}
            <defs>
              {GRADIENT_COLORS.map((gradient, index) => (
                <linearGradient
                  key={index}
                  id={`gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={gradient.start} />
                  <stop offset="100%" stopColor={gradient.end} />
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={40} // Donut style for modern look
              paddingAngle={2} // Space between slices
              label={renderCustomLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={animate ? 1000 : 0}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${index % GRADIENT_COLORS.length})`}
                  stroke="white"
                  strokeWidth={2}
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value, entry) => {
                const percentage = (
                  (entry.payload[dataKey] / total) *
                  100
                ).toFixed(1);
                return `${value} (${percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text for donut chart */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Enhanced legend */}
      <CustomLegend
        payload={data.map((item, index) => ({
          color: COLORS[index % COLORS.length],
          payload: item,
        }))}
      />

      {/* Additional stats section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {data.length}
            </div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">{total}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {data.length > 0 ? Math.round(total / data.length) : 0}
            </div>
            <div className="text-sm text-gray-500">Average</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {data.length > 0 ? Math.max(...data.map((d) => d[dataKey])) : 0}
            </div>
            <div className="text-sm text-gray-500">Highest</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartCustom;
