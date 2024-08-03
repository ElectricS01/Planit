/** @type {import('sequelize-cli').Migration} */

/*
 * Sequelize migration file, these files manage the database,
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Tasks", "type", {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.SMALLINT.UNSIGNED
    })
    await queryInterface.addColumn("Tasks", "startAt", {
      type: Sequelize.DATE
    })
  }
}
