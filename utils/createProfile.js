const { join } = require('path');
const Canvas = require('@napi-rs/canvas');

const createProfile = async (data, user, member) => {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext('2d');

  Canvas.GlobalFonts.registerFromPath(
    join(__dirname, '..', 'assets', 'fonts', 'MouldyCheese-Regular.ttf'),
    'Mouldy Cheese'
  );

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#4158D0');
  gradient.addColorStop(0.5, '#C850C0');
  gradient.addColorStop(1, '#FFCC70');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 15);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 680, 230, 15);
  ctx.fill();

  // User info section
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'black';
  ctx.fillStyle = data.settings.color || 'white';
  ctx.font = '32px Mouldy Cheese';
  ctx.fillText(user.displayName, 30, 50);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '18px Mouldy Cheese';
  ctx.fillText(`Level: ${data.totalLevel}`, 45, 105);
  ctx.fillText(`Joined: ${member.joinedAt.toDateString()}`, 45, 145);
  ctx.fillText(`Rep: ${data.reputation || 0}`, 45, 185);
  ctx.fillText(
    `Views: ${data.profileViews ? data.profileViews + 1 : 1}`,
    45,
    225
  );

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
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();

  // Username badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.roundRect(500, 210, 175, 30, 15);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = '16px Mouldy Cheese';
  ctx.textAlign = 'center';
  ctx.fillText(user.username, 587.5, 230);

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
    ctx.fillStyle = 'white';
    ctx.fill();
  });

  return canvas.encode('png');
};

module.exports = createProfile;
