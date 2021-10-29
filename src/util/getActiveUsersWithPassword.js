const users = require("../data/users.json");
module.exports = function (availableUsers) {
  const activeUsers = availableUsers.filter((availableUser) => {
    const userFound = users.find((user) =>
      user.account.includes(availableUser.account)
    );
    if (userFound) {
      availableUser.password = userFound.password;
    }
    return userFound;
  });
  return activeUsers;
};
