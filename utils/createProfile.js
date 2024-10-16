const { join } = require('path');
const Canvas = require('@napi-rs/canvas');
const checkTitle = require('./checkTitle');

const createProfile = async (data, user, member, serverID) => {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext('2d');

  Canvas.GlobalFonts.registerFromPath(
    join(__dirname, '..', 'assets', 'fonts', 'MouldyCheese-Regular.ttf'),
    'Mouldy Cheese'
  );

  // Background
  let backgroundColor;
  switch (data.settings.background) {
    case 'gradient':
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, '#4158D0');
      gradient.addColorStop(0.5, '#C850C0');
      gradient.addColorStop(1, '#FFCC70');
      backgroundColor = gradient;
      break;
    case 'dark':
      backgroundColor = '#2C3E50';
      break;
    case 'light':
      backgroundColor = '#ECF0F1';
      break;
    default:
      backgroundColor = '#2C3E50';
      break;
  }

  ctx.fillStyle = backgroundColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 15);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 680, 230, 15);
  ctx.fill();

  let textColor;
  switch (data.settings.text) {
    case 'dark':
      textColor = 'rgba(0, 0, 0, 0.7)';
      break;
    case 'light':
      textColor = 'rgba(255, 255, 255, 0.7)';
      break;
    default:
      textColor = 'rgba(255, 255, 255, 0.7)';
      break;
  }

  // User info section
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'black';
  ctx.fillStyle = data.settings.color || 'white';
  ctx.font = '32px Mouldy Cheese';

  const title = await checkTitle(data, serverID);
  ctx.fillText(title + user.displayName, 30, 50);

  ctx.fillStyle = textColor;
  ctx.font = '18px Mouldy Cheese';
  ctx.fillText(`Level: ${data.totalLevel}`, 45, 105);
  ctx.fillText(`Rep: ${data.reputation || 0}`, 45, 145);
  ctx.fillText(
    `Views: ${data.profileViews ? data.profileViews + 1 : 1}`,
    45,
    185
  );
  ctx.fillText(`Joined: ${member.joinedAt.toDateString()}`, 45, 225);

  // Avatar
  const avatar = await Canvas.loadImage(
    user.displayAvatarURL({ format: 'png' })
  );
  ctx.save();
  ctx.beginPath();
  ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 500, 25, 175, 175);
  ctx.restore();

  // Avatar border
  ctx.strokeStyle = data.settings.color || 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();

  // Username badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.roundRect(500, 210, 175, 25, 15);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.font = '16px Mouldy Cheese';
  ctx.textAlign = 'center';
  ctx.fillText(user.username, 587.5, 228);

  // Icons
  const iconPositions = [
    { x: 32, y: 100 },
    { x: 32, y: 138 },
    { x: 32, y: 178 },
    { x: 32, y: 218 },
  ];

  iconPositions.forEach((pos) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2, true);
    ctx.fillStyle = textColor;
    ctx.fill();
  });

  return canvas.encode('png');
};

module.exports = createProfile;
