import axios from "axios";

export async function getLyrics(artist, title) {
  try {
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );

    if (response.data.lyrics) {
      // Clean and format the lyrics with an empty line after each line
      return response.data.lyrics
        .split(/\n+/) // Split at existing newlines
        .map(line => line.trim()) // Trim spaces around each line
        .filter(line => line) // Remove any empty lines
        .map(line => `${line}\n\n`) // Add an empty line after each lyric line
        .join(''); // Rejoin all with the added newlines
    }

    return null;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}
