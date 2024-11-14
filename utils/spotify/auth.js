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
