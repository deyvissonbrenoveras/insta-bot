require("dotenv").config();
const InstagramBot = require("./src/controls/InstagramBot").InstagramBot;
const getActiveUsersWithPassword = require("./src/util/getActiveUsersWithPassword");
const GanharNoInstaBot =
  require("./src/controls/GanharNoInstaBot").GanharNoInstaBot;
var ganharNoInstaBot;
async function start() {
  ganharNoInstaBot = await new GanharNoInstaBot();
  await ganharNoInstaBot.logon();

  const availableUsers = await ganharNoInstaBot.getAvailableUsers();
  const activeUsers = getActiveUsersWithPassword(availableUsers);

  let instagramBot = await new InstagramBot(
    activeUsers[0].account,
    activeUsers[0].password
  );

  let action = await ganharNoInstaBot.requestAction(availableUsers[0].id);
  await instagramBot.doAction(action.action);
  setInterval(async () => {
    action = await ganharNoInstaBot.confirmAction(
      availableUsers[0].id,
      action.idp,
      action.idep
    );
    await instagramBot.doAction(action.action);
  }, 10000);
}
start();
