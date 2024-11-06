import { getSpotifyAccessToken, getSongRecommendations } from "../utils/spotifyUtils.js";

export default (client) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        if (message.content.startsWith('Spoti.recommend')) {
            const songName = message.content.split('Spoti.recommend ')[1];
            if (!songName) return message.reply("Please provide a song name!");

            // Get the Spotify access token
            const accessToken = await getSpotifyAccessToken();
            if (!accessToken) return message.reply("Could not retrieve Spotify access token.");

            // Get song recommendations based on the track name
            const recommendations = await getSongRecommendations(songName, accessToken);
            if (recommendations.length === 0) {
                return message.reply("Could not find any recommendations.");
            }

            // Send the recommended songs
            const recommendationsMessage = recommendations.map(track => `- [${track.name}](${track.external_urls.spotify}) by ${track.artists.map(artist => artist.name).join(', ')}`).join("\n");
            message.reply(`Here are some recommendations based on "${songName}":\n${recommendationsMessage}`);
        }
    });
};
