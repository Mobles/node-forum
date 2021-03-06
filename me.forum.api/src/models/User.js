const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt'))

function hashPassword (user) {
  const SALT_FACTOR = 8

  if(!user.changed('password')) {
    return;
  }

  return bcrypt
    .genSalt(SALT_FACTOR)
    .then(salt => bcrypt.hash(user.password, salt))
    .then(hash => {
      user.setDataValue('password', hash)
    })
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    profilePicture: {type: DataTypes.TEXT, defaultValue: 'https://placeimg.com/256/256/any'},
    bio: DataTypes.TEXT,
    role: {type: DataTypes.STRING, defaultValue: 'member'},
    createdThreads: {type: DataTypes.INTEGER, defaultValue: 0},
    active: {type: DataTypes.INTEGER, defaultValue: 0}
  }, {
    hooks: {
      beforeSave: hashPassword
    },
    indexes: [
      {
        unique: true,
        fields: ['email', 'username']
      }
    ]

  })

  User.prototype.comparePassword = function (password) {
    return bcrypt.compare(password, this.password)
  }

  return User
}
