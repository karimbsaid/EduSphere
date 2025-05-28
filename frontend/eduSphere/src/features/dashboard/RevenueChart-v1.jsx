import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
export default function RevenueChart({ labels, data }) {
  const chartData = labels.map((label, index) => ({
    month: label,
    revenue: data[index],
  }));

  return (
    <LineChart width={500} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="revenue"
        stroke="#1E90FF"
        name="Revenus (TND)"
      />
    </LineChart>
  );
}
