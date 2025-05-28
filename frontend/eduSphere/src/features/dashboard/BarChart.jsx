import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Modern color palette
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

// Gradient definitions for bars
const GRADIENT_COLORS = [
  { id: "gradient0", start: "#667eea", end: "#764ba2" },
  { id: "gradient1", start: "#f093fb", end: "#f5576c" },
  { id: "gradient2", start: "#4facfe", end: "#00f2fe" },
  { id: "gradient3", start: "#43e97b", end: "#38f9d7" },
  { id: "gradient4", start: "#ffecd2", end: "#fcb69f" },
  { id: "gradient5", start: "#a8edea", end: "#fed6e3" },
  { id: "gradient6", start: "#ff9a9e", end: "#fecfef" },
  { id: "gradient7", start: "#fad0c4", end: "#ffd1ff" },
];

const BarChartCustom = ({
  data = [],
  dataKey = "value",
  nameKey = "name",
  title = "Students by Category",
  xAxisLabel = "Categories",
  yAxisLabel = "Number of Students",
  showGrid = true,
  animate = true,
  barRadius = 8,
  useGradients = true,
}) => {
  console.log(data);
  // Calculate total and stats
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Students:{" "}
            <span className="font-medium text-blue-600">{data.value}</span>
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

  const CustomBar = (props) => {
    const { fill, ...otherProps } = props;
    return (
      <Bar
        {...otherProps}
        fill={fill}
        className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
      />
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white to-gray-50 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
      </div>

      {/* Chart Container */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            {/* Define gradients */}
            <defs>
              {useGradients &&
                GRADIENT_COLORS.map((gradient, index) => (
                  <linearGradient
                    key={gradient.id}
                    id={gradient.id}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={gradient.start} />
                    <stop offset="100%" stopColor={gradient.end} />
                  </linearGradient>
                ))}
            </defs>

            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e7ff"
                opacity={0.6}
              />
            )}

            <XAxis
              dataKey={nameKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "#6b7280",
                  fontSize: "12px",
                },
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey={dataKey}
              radius={[barRadius, barRadius, 0, 0]}
              animationDuration={animate ? 1000 : 0}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    useGradients
                      ? `url(#${
                          GRADIENT_COLORS[index % GRADIENT_COLORS.length].id
                        })`
                      : COLORS[index % COLORS.length]
                  }
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCustom;
