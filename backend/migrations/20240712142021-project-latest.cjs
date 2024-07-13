/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Projects", "latest", {
      allowNull: false,
      type: Sequelize.DATE
    })
  }
}
