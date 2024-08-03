/** @type {import('sequelize-cli').Migration} */

/*
 * Sequelize migration file, these files manage the database,
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      emailVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      emailToken: {
        allowNull: false,
        type: Sequelize.STRING
      },
      admin: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      avatar: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        defaultValue: "online",
        type: Sequelize.STRING
      },
      statusMessage: {
        type: Sequelize.STRING
      },
      saveSwitcher: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      switcherHistory: {
        defaultValue: [],
        type: Sequelize.JSON
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
    await queryInterface.dropTable("Users")
  }
}
