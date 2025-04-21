import { HiArrowRight } from "react-icons/hi2";
import { motion } from "motion/react";

const Process = () => {
  const steps = [
    {
      step: "01",
      title: "Choisissez votre cours",
      description:
        "Parcourez notre catalogue de milliers de cours dans tous les domaines.",
      icon: "🔍",
      color: "bg-blue-500",
    },
    {
      step: "02",
      title: "Apprenez à votre rythme",
      description:
        "Accédez aux cours n'importe où, n'importe quand, sur tous vos appareils.",
      icon: "⏱️",
      color: "bg-purple-500",
    },
  ];
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comment fonctionne notre plateforme
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour commencer votre parcours
            d&apos;apprentissage et transformer votre carrière.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card rounded-xl p-8 shadow-sm relative z-10 h-full">
                <div
                  className={`${item.color} z-100 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl mb-6`}
                >
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {index < 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                  <HiArrowRight className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Process;
