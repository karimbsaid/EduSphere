import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
export default function CourseStatsChart({ isAdmin, courseStats }) {
  if (isAdmin) {
    const chartData = courseStats.map((stat) => ({
      course: stat.courseTitle,
      revenue: stat.totalRevenue,
      students: stat.totalStudents,
    }));

    return (
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="revenue"
          fill="#1E90FF"
          name="Revenus (TND)"
        />
        <Bar
          yAxisId="right"
          dataKey="students"
          fill="#32CD32"
          name="Étudiants"
        />
      </BarChart>
    );
  } else {
    const chartData = courseStats.map((stat) => ({
      course: stat.courseTitle,
      students: stat.totalStudents,
    }));

    return (
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="students" fill="#32CD32" name="Étudiants" />
      </BarChart>
    );
  }
}
