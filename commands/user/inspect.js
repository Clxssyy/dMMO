const { SlashCommandBuilder } = require("@discordjs/builders");
const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const serverSchema = require("../../schemas/server");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspect")
    .setDescription("Inspect the user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to inspect")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    if (user.bot) {
      return await interaction.reply({
        content: "Bots don't have custom profiles!",
        ephemeral: true,
      });
    }

    let serverData = await serverSchema.findOne({
      serverID: interaction.guild.id,
    });
    if (!serverData) {
      console.log("Creating new server in database");
      await serverSchema.create({
        serverID: interaction.guild.id,
        users: [],
      });

      serverData = await serverSchema.findOne({
        serverID: interaction.guild.id,
      });
    }

    const stats = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );
    if (!stats) {
      return await interaction.reply({
        content: "User doesn't have a profile yet",
        ephemeral: true,
      });
    }

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#4158D0");
    gradient.addColorStop(0.5, "#C850C0");
    gradient.addColorStop(1, "#FFCC70");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 15);
    ctx.fill();

    // User info section
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 32px Arial";
    ctx.fillText(user.displayName, 30, 50);

    ctx.font = "18px Arial";
    ctx.fillText(`Level: ${stats.totalLevel}`, 40, 90);
    ctx.fillText(`Joined: ${member.joinedAt.toDateString()}`, 40, 120);
    ctx.fillText(`Rep: ${stats.reputation}`, 40, 150);
    ctx.fillText(`Views: ${0}`, 40, 180);

    // Avatar
    const avatar = await Canvas.loadImage(
      user.displayAvatarURL({ format: "png" })
    );
    ctx.save();
    ctx.beginPath();
    ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 500, 25, 175, 175);
    ctx.restore();

    // Avatar border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();

    // Username badge
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(500, 210, 175, 30, 15);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(user.username, 540, 230);

    // Icons
    const iconPositions = [
      { x: 30, y: 80 },
      { x: 30, y: 110 },
      { x: 30, y: 140 },
      { x: 30, y: 170 },
    ];

    iconPositions.forEach((pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2, true);
      ctx.fillStyle = "white";
      ctx.fill();
    });

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "inspect.png",
    });

    await interaction.reply({ files: [attachment] });
  },
};
