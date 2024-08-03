/** @type {import('sequelize-cli').Migration} */

/*
 * Sequelize migration file, these files manage the database,
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Projects", "latest", {
      allowNull: false,
      type: Sequelize.DATE
    })
  }
}
