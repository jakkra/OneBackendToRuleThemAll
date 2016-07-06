module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
	  email: {
	    type: DataTypes.STRING,
	    primaryKey: true
	  },
	  name: DataTypes.STRING,
	  password: DataTypes.STRING,
	}, {
	});
  return User;
}
