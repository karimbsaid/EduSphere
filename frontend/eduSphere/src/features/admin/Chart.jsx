/* eslint-disable react/prop-types */
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function Chart({ type = "area", data, xKey, yKeys }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg">
      <ResponsiveContainer width="100%" height={300}>
        {type === "area" && (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {yKeys.map((key, index) => (
                <linearGradient
                  key={key}
                  id={`color${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={index % 2 === 0 ? "#3b82f6" : "#10b981"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={index % 2 === 0 ? "#3b82f6" : "#10b981"}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey={xKey} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={index % 2 === 0 ? "#3b82f6" : "#10b981"}
                fillOpacity={1}
                fill={`url(#color${key})`}
              />
            ))}
          </AreaChart>
        )}

        {type === "bar" && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={index % 2 === 0 ? "#3b82f6" : "#10b981"}
              />
            ))}
          </BarChart>
        )}

        {type === "line" && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={index % 2 === 0 ? "#3b82f6" : "#10b981"}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
