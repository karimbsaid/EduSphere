import React from "react";
import {
  FaUsers,
  FaBookOpen,
  FaDollarSign,
  FaChartBar,
  FaArrowUp,
} from "react-icons/fa";
import Card from "../../ui/Card";

const statsData = [
  {
    title: "Utilisateurs totaux",
    value: "12,456",
    growth: "+124 cette semaine",
    icon: <FaUsers className="h-5 w-5 text-gray-400" />,
  },
  {
    title: "Cours actifs",
    value: "245",
    growth: "+8 ce mois-ci",
    icon: <FaBookOpen className="h-5 w-5 text-gray-400" />,
  },
  {
    title: "Revenus totaux",
    value: "128,590 €",
    growth: "+12% depuis le mois dernier",
    icon: <FaDollarSign className="h-5 w-5 text-gray-400" />,
  },
  {
    title: "Taux de complétion",
    value: "68%",
    growth: "+2% depuis le mois dernier",
    icon: <FaChartBar className="h-5 w-5 text-gray-400" />,
  },
];

export default function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between pb-2 text-sm font-medium">
            {stat.title}
            {stat.icon}
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="flex items-center text-xs text-green-500 mt-1">
            <FaArrowUp className="h-3 w-3 mr-1" />
            <span>{stat.growth}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
