import { getSpotifyAccessToken, getSongRecommendations, getRandomTrack, getTrackDetails } from "../utils/spotifyUtils.js";
import { EmbedBuilder } from "discord.js"; // Updated import

export default (client) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        // Convert the message content to lowercase for checking the prefix
        const lowerCaseContent = message.content.toLowerCase();
        const prefix1 = "spoti.";

        // Command to show all the commands of bot
        if (lowerCaseContent.startsWith(`${prefix1}help`)) {
            const helpEmbed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle('SpotiBot Help')
                .setDescription('Here are the available commands for SpotiBot:')
                .addFields(
                    { name: 'spoti.recommend [song name]', value: 'Get song recommendations based on the provided song name.' },
                    { name: 'spoti.random', value: 'Get a random song from Spotify.' },
                    { name: 'spoti.details [song name]', value: 'Get detailed information about a specific song.' },
                    { name: 'spoti.help', value: 'Shows this help message with a list of available commands.' }
                )
                .setFooter({ text: 'Powered by Spotify' });

            message.reply({ embeds: [helpEmbed] });
        }

        // Command for song recommendations
        if (lowerCaseContent.startsWith(`${prefix1}recommend`)) {
            const songName = message.content.split(/spoti\.recommend\s+/i)[1];
            if (!songName) return message.reply("Please provide a song name!");

            const accessToken = await getSpotifyAccessToken();
            if (!accessToken) return message.reply("Could not retrieve Spotify access token.");

            const recommendations = await getSongRecommendations(songName, accessToken);
            if (recommendations.length === 0) {
                return message.reply("Could not find any recommendations.");
            }

            const recommendationsEmbed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle(`Recommendations based on "${songName}"`)
                .setDescription('Here are some song recommendations for you:')
                .setFooter({ text: 'Powered by Spotify' });

            // Add fields for each recommended song
            recommendations.forEach((track, index) => {
                recommendationsEmbed.addFields({
                    name: `${index + 1}. ${track.name}`,
                    value: `By: ${track.artists.map(artist => artist.name).join(', ')}\n[Listen on Spotify](${track.external_urls.spotify})`,
                    inline: false
                });
            });

            // Set the thumbnail once after adding all fields
            recommendationsEmbed.setThumbnail(recommendations[0]?.album.images[0]?.url); // Set thumbnail for first track

            message.reply({ embeds: [recommendationsEmbed] });
        }

        // Command for random track
        if (lowerCaseContent.startsWith(`${prefix1}random`)) {
            const accessToken = await getSpotifyAccessToken();
            if (!accessToken) return message.reply("Could not retrieve Spotify access token.");

            const randomTrack = await getRandomTrack(accessToken);
            if (!randomTrack) {
                return message.reply("Could not find a random track.");
            }

            const randomTrackEmbed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle(randomTrack.name)
                .setDescription(`By: ${randomTrack.artists.map(artist => artist.name).join(', ')}\n[Listen on Spotify](${randomTrack.external_urls.spotify})`)
                .setImage(randomTrack.album.images[0]?.url)
                .setFooter({ text: 'Powered by Spotify' });

            message.reply({ embeds: [randomTrackEmbed] });
        }

        // Command for track details
        if (lowerCaseContent.startsWith(`${prefix1}details`)) {
            const songName = message.content.split(/spoti\.details\s+/i)[1];
            if (!songName) return message.reply("Please provide a song name!");

            const accessToken = await getSpotifyAccessToken();
            if (!accessToken) return message.reply("Could not retrieve Spotify access token.");

            const trackDetails = await getTrackDetails(songName, accessToken);
            if (!trackDetails) return message.reply("Could not find the track details.");

            const trackEmbed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle(trackDetails.name)
                .setURL(trackDetails.spotifyLink)
                .setAuthor({ name: trackDetails.artist })
                .setDescription(`Album: ${trackDetails.album}`)
                .addFields(
                    { name: 'Release Date', value: trackDetails.releaseDate, inline: true },
                    { name: 'Duration', value: `${trackDetails.duration} min`, inline: true },
                    { name: 'Popularity', value: `${trackDetails.popularity}`, inline: true }
                )
                .setThumbnail(trackDetails.imageUrl)
                .setFooter({ text: 'Powered by Spotify' });

            message.channel.send({ embeds: [trackEmbed] });
        }
    });
};
