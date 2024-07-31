/** @type {import('sequelize-cli').Migration} */
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
