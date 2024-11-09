import { getSpotifyAccessToken, getSongRecommendations, getRandomTrack } from "../utils/spotifyUtils.js";

export default (client) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        // Convert the message content to lowercase for checking the prefix
        const lowerCaseContent = message.content.toLowerCase();
        const prefix1 = "spoti.";

        if (lowerCaseContent.startsWith(`${prefix1}recommend`)) {
            // Extract the song name from the original message content (to preserve case)
            const songName = message.content.split(/spoti\.recommend\s+/i)[1];
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






        if (lowerCaseContent.startsWith(`${prefix1}random`)) {

             // Get the Spotify access token
            const accessToken = await getSpotifyAccessToken();
            if (!accessToken) return message.reply("Could not retrieve Spotify access token.");


            // Get a random track
            const randomTrack = await getRandomTrack(accessToken);

            if (!randomTrack) {
                return message.reply("Could not find a random track.");
            }

            // Send the random track
            message.reply(`Here is a random track:\n- [${randomTrack.name}](${randomTrack.external_urls.spotify}) by ${randomTrack.artists.map(artist => artist.name).join(', ')}`);
        }
    });
};

