module.exports = function (user, skill) {
  var level = 0;
  var newLevel = level;

  if (level == 0) {
    newLevel = 1;
  } else {
    newLevel += 1 / (Math.floor(level) * 10);
  }

  if (newLevel > level) {
    user.send(`You leveled up ${skill} to level ${Math.floor(newLevel)}!`);
  }
};
