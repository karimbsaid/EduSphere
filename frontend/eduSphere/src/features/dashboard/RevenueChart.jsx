import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Composant Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 min-w-[180px]">
        <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <span className="text-gray-800 font-semibold">
            {payload[0].value.toLocaleString()} TND
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Composant Legend personnalisé
const CustomLegend = () => (
  <div className="flex items-center justify-center mt-6">
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <span className="text-gray-700 font-medium text-sm">Revenus (TND)</span>
    </div>
  </div>
);

export default function RevenueChart({ labels, data }) {
  const chartData = labels.map((label, index) => ({
    month: label,
    revenue: data[index],
  }));

  // Calculer les statistiques pour l'affichage
  const totalRevenue = data.reduce((sum, val) => sum + val, 0);
  const maxRevenue = Math.max(...data);
  const avgRevenue = totalRevenue / data.length;

  return (
    <div className="w-full p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100">
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Évolution des Revenus
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalRevenue.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">TND</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Maximum</p>
            <p className="text-2xl font-bold text-gray-800">
              {maxRevenue.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">TND</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Moyenne</p>
            <p className="text-2xl font-bold text-gray-800">
              {Math.round(avgRevenue).toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">TND</span>
            </p>
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              animationDuration={1500}
              animationBegin={200}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{
                fill: "#FFFFFF",
                stroke: "url(#lineGradient)",
                strokeWidth: 3,
                r: 5,
              }}
              activeDot={{
                r: 7,
                fill: "#FFFFFF",
                stroke: "url(#lineGradient)",
                strokeWidth: 3,
                drop: true,
              }}
              animationDuration={1500}
              animationBegin={400}
            />
          </AreaChart>
        </ResponsiveContainer>

        <CustomLegend />
      </div>

      {/* Footer avec informations additionnelles */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <p>Données actualisées en temps réel</p>
        <p>{labels.length} points de données</p>
      </div>
    </div>
  );
}
