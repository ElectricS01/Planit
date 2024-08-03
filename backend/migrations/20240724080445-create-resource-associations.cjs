/** @type {import('sequelize-cli').Migration} */

/*
 * Sequelize migration file, these files manage the database,
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ResourceAssociations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resourceId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      taskId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable("ResourceAssociations")
  }
}
