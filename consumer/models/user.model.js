module.exports = (sequelize, Sequelize) => {
  const USER = sequelize.define("User", {
    userName: {
      type: Sequelize.STRING,
    },
    userEmail: {
      type: Sequelize.STRING,
    },
    userMessage: {
      type: Sequelize.STRING,
    },
  });

  return USER;
};
