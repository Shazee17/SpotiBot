import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

export const getSpotifyAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.SPOTIFY_CLIENT_ID, 
          password: process.env.SPOTIFY_CLIENT_SECRET,  
        },
      }
    );

    const accessToken = response.data.access_token;  // The access token from the response
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
  }
};




// Function to search for a track and get its ID
export const getTrackId = async (trackName, accessToken) => {
    const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
            q: trackName,
            type: 'track',
            limit: 1,
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    
    if (response.data.tracks.items.length > 0) {
        return response.data.tracks.items[0].id;  // Get the first track ID
    } else {
        return null;  // No track found
    }
};

// Function to get recommendations based on a track
export const getSongRecommendations = async (trackName, accessToken) => {
    try {
        const trackId = await getTrackId(trackName, accessToken);
        if (!trackId) {
            console.error("Track not found");
            return [];
        }

        const recommendations = await axios.get('https://api.spotify.com/v1/recommendations', {
            params: {
                limit: 5,
                seed_tracks: trackId, // Use the track ID instead of the name
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return recommendations.data.tracks;  // Return the recommended tracks
    } catch (error) {
        console.error('Error getting song recommendations:', error);
        return [];
    }
};