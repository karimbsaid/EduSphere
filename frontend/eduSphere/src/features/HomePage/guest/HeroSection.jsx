/* eslint-disable react/prop-types */
import { motion } from "motion/react";
import Button from "../../../ui/Button";
import {
  HiArrowRight,
  HiChevronRight,
  HiMiniMagnifyingGlass,
  HiOutlineBookOpen,
  HiOutlineCheckBadge,
  HiOutlineUsers,
} from "react-icons/hi2";
import myImage from "../../../assets/hero-image.jpg";

const HeroSection = ({ totalStudents }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transformez votre <span className="text-primary">avenir</span>{" "}
              avec des compétences qui comptent
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Découvrez des milliers de cours enseignés par des experts du monde
              entier et développez les compétences qui façonneront votre
              carrière.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="rounded-full px-8 bg-black text-white"
                label="Commencer maintenant"
                iconEnd={HiChevronRight}
              />
            </div>
            <div className="flex items-center mt-8 text-sm text-muted-foreground">
              <HiOutlineCheckBadge className="h-4 w-4 text-primary mr-2" />
              <span>Accès à vie aux cours</span>

              <HiOutlineCheckBadge className="h-4 w-4 text-primary mx-2 ml-4" />
              <span>Garantie satisfait</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-muted">
              <img
                src={myImage}
                alt="Plateforme d'apprentissage"
                className="w-full h-auto"
              />
              {/* Overlay avec texte */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-bold">
                  Apprenez à votre rythme
                </h3>
                <p className="text-white/80">
                  Des cours interactifs conçus pour votre réussite
                </p>
              </div>
            </div>

            {/* Éléments flottants */}
            <motion.div
              className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-3 z-20"
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <HiOutlineUsers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {totalStudents}+ Apprenants
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rejoignez la communauté
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
