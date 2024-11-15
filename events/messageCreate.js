import { auth, track, artist, album } from '../utils/spotify/index.js';
import { getLyrics } from '../utils/lyrics.js';
import { EmbedBuilder } from "discord.js";

export default (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Convert the message content to lowercase for checking the prefix
    const lowerCaseContent = message.content.toLowerCase();
    const prefix1 = "spoti.";

    // Command to show all the commands of bot
    if (lowerCaseContent.startsWith(`${prefix1}help`)) {
      const helpEmbed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle("SpotiBot Help")
        .setDescription("Here are the available commands for SpotiBot:")
        .addFields(
          {
            name: "spoti.recommend [song name]",
            value: "Get song recommendations based on the provided song name.",
          },
          { name: "spoti.random", value: "Get a random song from Spotify." },
          {
            name: "spoti.details [song name]",
            value: "Get detailed information about a specific song.",
          },
          {
            name: "spoti.artist [artist name]",
            value: "Get detailed information about a specific artist.",
          },
          {
            name: "spoti.album [album name]",
            value: "Get detailed information about a specific album.",
          },
          {
            name: "spoti.lyrics [song name] by [artist name]",
            value: "Get lyrics of the provided song.",
          },
          {
            name: "spoti.help",
            value: "Shows this help message with a list of available commands.",
          }
        )
        .setFooter({ text: "Powered by Spotify" });

      message.reply({ embeds: [helpEmbed] });
    }

    // Command for song recommendations
    if (lowerCaseContent.startsWith(`${prefix1}recommend`)) {
      const songName = message.content.split(/spoti\.recommend\s+/i)[1];
      if (!songName) return message.reply("Please provide a song name!");

      const accessToken = await auth.getSpotifyAccessToken();
      if (!accessToken)
        return message.reply("Could not retrieve Spotify access token.");

      const recommendations = await track.getSongRecommendations(
        songName,
        accessToken
      );
      if (recommendations.length === 0) {
        return message.reply("Could not find any recommendations.");
      }

      const recommendationsEmbed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle(`Recommendations based on "${songName}"`)
        .setDescription("Here are some song recommendations for you:")
        .setFooter({ text: "Powered by Spotify" });

      // Add fields for each recommended song
      recommendations.forEach((track, index) => {
        recommendationsEmbed.addFields({
          name: `${index + 1}. ${track.name}`,
          value: `By: ${track.artists
            .map((artist) => artist.name)
            .join(", ")}\n[Listen on Spotify](${track.external_urls.spotify})`,
          inline: false,
        });
      });

      // Set the thumbnail once after adding all fields
      recommendationsEmbed.setThumbnail(
        recommendations[0]?.album.images[0]?.url
      ); // Set thumbnail for first track

      message.reply({ embeds: [recommendationsEmbed] });
    }

    // Command for random track
    if (lowerCaseContent.startsWith(`${prefix1}random`)) {
      const accessToken = await auth.getSpotifyAccessToken();
      if (!accessToken)
        return message.reply("Could not retrieve Spotify access token.");

      const randomTrack = await track.getRandomTrack(accessToken);
      if (!randomTrack) {
        return message.reply("Could not find a random track.");
      }

      const randomTrackEmbed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle(randomTrack.name)
        .setDescription(
          `By: ${randomTrack.artists
            .map((artist) => artist.name)
            .join(", ")}\n[Listen on Spotify](${
            randomTrack.external_urls.spotify
          })`
        )
        .setImage(randomTrack.album.images[0]?.url)
        .setFooter({ text: "Powered by Spotify" });

      message.reply({ embeds: [randomTrackEmbed] });
    }

    // Command for track details
    if (lowerCaseContent.startsWith(`${prefix1}details`)) {
      const songName = message.content.split(/spoti\.details\s+/i)[1];
      if (!songName) return message.reply("Please provide a song name!");

      const accessToken = await auth.getSpotifyAccessToken();
      if (!accessToken)
        return message.reply("Could not retrieve Spotify access token.");

      const trackDetails = await track.getTrackDetails(songName, accessToken);
      if (!trackDetails)
        return message.reply("Could not find the track details.");

      const trackEmbed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle(trackDetails.name)
        .setURL(trackDetails.spotifyLink)
        .setAuthor({ name: trackDetails.artist })
        .setDescription(`Album: ${trackDetails.album}`)
        .addFields(
          {
            name: "Release Date",
            value: trackDetails.releaseDate,
            inline: true,
          },
          {
            name: "Duration",
            value: `${trackDetails.duration} min`,
            inline: true,
          },
          {
            name: "Popularity",
            value: `${trackDetails.popularity}`,
            inline: true,
          }
        )
        .setThumbnail(trackDetails.imageUrl)
        .setFooter({ text: "Powered by Spotify" });

      message.channel.send({ embeds: [trackEmbed] });
    }

    // Command for Artist Details
if (lowerCaseContent.startsWith(`${prefix1}artist`)) {
    try {
      const artistName = message.content.split(/spoti\.artist\s+/i)[1];
  
      if (!artistName) {
        return message.reply("Please provide an artist name!");
      }
  
      const accessToken = await auth.getSpotifyAccessToken();
      if (!accessToken) {
        return message.reply("Could not retrieve Spotify access token.");
      }
  
      const artistDetails = await artist.getArtistDetails(artistName, accessToken);
      if (!artistDetails) {
        return message.reply("Could not find the artist details.");
      }
  
      const artistEmbed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle(artistDetails.name || "Unknown Artist")
        .setURL(artistDetails.spotifyLink || "#")
        .setDescription(
          `**Genres**: ${artistDetails.genres || "N/A"}\n**Popularity**: ${artistDetails.popularity || "N/A"}/100\n**Followers**: ${
            artistDetails.followers
              ? artistDetails.followers.toLocaleString()
              : "N/A"
          }`
        )
        .setThumbnail(artistDetails.imageUrl || "")
        .setFooter({ text: "Powered by Spotify" });
  
      // Add top tracks if available
      if (Array.isArray(artistDetails.topTracks) && artistDetails.topTracks.length > 0) {
        artistEmbed.addFields({
          name: "Top Tracks",
          value: artistDetails.topTracks
            .map(
              (track, index) =>
                `${index + 1}. [${track.name || "Unknown"}](${track.spotifyLink || "#"})`
            )
            .join("\n"),
        });
      }
  
      // Add albums if available
      if (Array.isArray(artistDetails.albums) && artistDetails.albums.length > 0) {
        artistEmbed.addFields({
          name: "Albums",
          value: artistDetails.albums
            .map(
              (album, index) =>
                `${index + 1}. [${album.name || "Unknown"}](${album.spotifyLink || "#"}) (${album.totalTracks || "N/A"} tracks)`
            )
            .join("\n"),
        });
      }
  
      // Send the embed
      message.channel.send({ embeds: [artistEmbed] });
  
    } catch (error) {
      console.error("Error fetching artist details:", error);
      return message.reply("An error occurred while fetching artist details. Please try again later.");
    }
  }


 // Command for album details
if (lowerCaseContent.startsWith(`${prefix1}album`)) {
  try {
    const albumName = message.content.split(/spoti\.album\s+/i)[1];
    if (!albumName) return message.reply("Please provide an album name!");

    const accessToken = await auth.getSpotifyAccessToken();
    if (!accessToken)
      return message.reply("Could not retrieve Spotify access token.");

    const albumDetails = await album.getAlbumDetails(albumName, accessToken);
    if (!albumDetails)
      return message.reply("Could not find the album details.");

    const albumEmbed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle(albumDetails.album.name || "Unknown Album")
      .setURL(albumDetails.album.spotifyLink || "#")
      .setDescription(`Artist: ${albumDetails.album.artist || "Unknown Artist"}`)
      .addFields(
        {
          name: "Release Date",
          value: albumDetails.album.releaseDate ? String(albumDetails.album.releaseDate) : "N/A", // Ensure it's a string
          inline: true,
        },
        {
          name: "Total Tracks",
          value: albumDetails.album.totalTracks ? String(albumDetails.album.totalTracks) : "N/A", // Ensure it's a string
          inline: true,
        }
      )
      .setThumbnail(albumDetails.album.imageUrl || "")
      .setFooter({ text: "Powered by Spotify" });

    // Add track list if available
    if (Array.isArray(albumDetails.tracks) && albumDetails.tracks.length > 0) {
      albumEmbed.addFields({
        name: "Tracks",
        value: albumDetails.tracks
          .map(
            (track, index) =>
              `${index + 1}. [${track.name || "Unknown"}](${track.spotifyLink || "#"})`
          )
          .join("\n"),
      });
    }

    // Send the embed
    message.channel.send({ embeds: [albumEmbed] });
  } catch (error) {
    console.error("Error fetching album details:", error);
    message.reply("An error occurred while fetching the album details. Please try again later.");
  }
}

// Command for song lyrics
if (lowerCaseContent.startsWith(`${prefix1}lyrics`)) {
  const input = message.content.split(/spoti\.lyrics\s+/i)[1];
  if (!input) return message.reply("Please provide a song name and artist!");

  // Extract song name and artist name
  const [songName, artistName] = input.split(' by ');
  if (!songName || !artistName) {
    return message.reply("Please use the format: spoti.lyrics [song name] by [artist name]");
  }

  try {
    const lyrics = await getLyrics(artistName.trim(), songName.trim());
    
    if (!lyrics) {
      return message.reply(`Could not find lyrics for "${songName}" by ${artistName}`);
    }

    // Creating a response embed
    const lyricsEmbed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle(`Lyrics for "${songName}" by ${artistName}`)
      .setDescription(lyrics.slice(0, 4096)) // Truncate if lyrics exceed 4096 characters
      .setFooter({ text: "Powered by Lyrics.ovh" });

    message.channel.send({ embeds: [lyricsEmbed] });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    message.reply("An error occurred while fetching the lyrics. Please try again later.");
  }
}
  
  });
};
