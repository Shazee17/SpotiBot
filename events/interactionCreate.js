import { getSpotifyAccessToken, getSongRecommendations, getRandomTrack } from "../utils/spotifyUtils.js";


export default (client) => {
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;


      //Interaction to reply with a random song
      if (interaction.commandName === 'random') {
        // Defer the reply to acknowledge the interaction (optional)
        await interaction.deferReply();
  
        // Get the Spotify access token
        const accessToken = await getSpotifyAccessToken();
        if (!accessToken) {
          return interaction.editReply('Could not retrieve Spotify access token.');
        }
  
        // Get a random track
        const randomTrack = await getRandomTrack(accessToken);
  
        if (!randomTrack) {
          return interaction.editReply('Could not find a random track.');
        }
  
        // Send the random track
        interaction.editReply(`Here is a random track:\n- [${randomTrack.name}](${randomTrack.external_urls.spotify}) by ${randomTrack.artists.map(artist => artist.name).join(', ')}`);
      }

    });
};