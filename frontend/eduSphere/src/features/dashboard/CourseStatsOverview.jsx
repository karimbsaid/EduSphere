/* eslint-disable react/prop-types */
import React from "react";
import { motion } from "motion/react";
import StatCard from "./StatCard";

export default function CourseStatsOverview({ stats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.label}
          value={stat.value}
          Icon={stat.Icon}
        />
      ))}
    </div>
  );
}
