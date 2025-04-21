const Interaction = require("../models/interaction.model");

const interactionWeights = {
  view: 1,
  search: 2,
  click: 3,
  complete: 5,
};

const createInteraction = async (userId, type, feature) => {
  console.log("creation", userId, type, feature);
  const weight = interactionWeights[type] || 1;

  //   // Supprimer interactions plus vieilles que 30 min
  //   const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  //   await Interaction.deleteMany({
  //     userId,
  //     timestamp: { $lt: thirtyMinutesAgo },
  //   });

  const interaction = new Interaction({
    student: userId,
    interactionType: type,
    feature: feature,
    weight: weight,
    // timestamp: new Date(),
  });

  await interaction.save();
  return interaction;
};
module.exports = { createInteraction };
