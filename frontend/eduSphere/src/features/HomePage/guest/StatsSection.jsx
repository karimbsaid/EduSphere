/* eslint-disable react/prop-types */
/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { FaBook, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

const StatsSection = ({ totalCourses, totalStudents, totalInstructors }) => {
  console.log(totalInstructors, totalStudents);
  const stats = [
    { label: "Cours", value: totalCourses, icon: FaBook },
    { label: "Apprenants", value: totalStudents, icon: FaUserGraduate },
    {
      label: "Instructeurs",
      value: totalInstructors,
      icon: FaChalkboardTeacher,
    },
  ];

  return (
    <section className="py-16 bg-muted/30 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-gray-200 rounded-full p-4 mb-4 flex items-center justify-center w-16 h-16">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
