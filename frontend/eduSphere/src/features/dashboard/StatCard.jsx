/* eslint-disable react/prop-types */
import React from "react";
import { motion } from "motion/react";
import Card from "../../ui/Card";

export default function StatCard({ title, Icon, value, progress = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-sm flex-col">
        <div className="pb-2">
          <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        </div>
        <div>
          <div className="flex flex-col ">
            <div className="flex gap-2 items-center">
              {Icon && <Icon className="mr-2 h-5 w-5 text-primary" />}
              <span className="text-2xl font-bold">{value}</span>
            </div>

            <span className="text-l text-green-600 font-normal">
              {progress}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
