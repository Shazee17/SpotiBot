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


//Function to search for an artist and get its ID
export const getArtistId = async (artistName, accessToken) => {
    const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
            q: artistName,
            type: 'artist',
            limit: 1,
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (response.data.artists.items.length > 0) {
        return response.data.artists.items[0].id;  // Get the first track ID
    } else {
        return null;  // No Artists found
    }
}


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


// Function to get a random track using a random letter
export const getRandomTrack = async (accessToken) => {
  try {
      // Generate a random letter or string for the search query
      const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Random letter from 'a' to 'z'

      // Search for tracks with the random letter
      const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
              Authorization: `Bearer ${accessToken}`,
          },
          params: {
              q: randomLetter,
              type: 'track',
              limit: 50, // You can adjust the limit to get more tracks
          },
      });

      const tracks = searchResponse.data.tracks.items;

      if (tracks.length === 0) {
          console.log('No tracks found for this query.');
          return null;
      }

      // Pick a random track from the list
      const randomIndex = Math.floor(Math.random() * tracks.length);
      const randomTrack = tracks[randomIndex];

      console.log(`Random Track Name: ${randomTrack.name} by ${randomTrack.artists.map(artist => artist.name).join(', ')}`);
      console.log(`Track ID: ${randomTrack.id}`);
      
      return randomTrack;
  } catch (error) {
      console.error('Error getting random track:', error);
      return null;
  }
};



//Function to get details of a track
export const getTrackDetails = async (trackName, accessToken) => {
    try {
        const trackId = await getTrackId(trackName, accessToken);
        if (!trackId) {
            console.error("Track not found");
            return null;
        }


        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

       
        const trackDetails = response.data;

        return {
            name: trackDetails.name,
            album: trackDetails.album.name,
            artist: trackDetails.artists.map(artist => artist.name).join(", "),
            releaseDate: trackDetails.album.release_date,
            duration: (trackDetails.duration_ms / 60000).toFixed(2), // Convert ms to minutes
            previewUrl: trackDetails.preview_url,
            spotifyLink: trackDetails.external_urls.spotify,
            popularity: trackDetails.popularity,

            // Access the first image's URL or the last one for higher resolution
            imageUrl: trackDetails.album.images[0]?.url // Get the first image URL
        };
        
    } catch (error) {
        console.error('Error getting track details:', error);
      return null;
    }
}


export const getArtistDetails = async (artistName, accessToken) => {
    try {
        const artistId = await getArtistId(artistName, accessToken);

        if (!artistId) {
            console.log("Artist not found");
            return null;
        }

        // Get basic artist details
        const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const artistDetails = artistResponse.data;

        // Get artist's top tracks
        const topTracksResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const topTracks = topTracksResponse.data.tracks.map(track => ({
            name: track.name,
            album: track.album.name,
            duration: (track.duration_ms / 60000).toFixed(2), // Convert ms to minutes
            spotifyLink: track.external_urls.spotify,
        }));

        // Get artist's albums
        const albumsResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=5`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const albums = albumsResponse.data.items.map(album => ({
            name: album.name,
            releaseDate: album.release_date,
            totalTracks: album.total_tracks,
            spotifyLink: album.external_urls.spotify,
            imageUrl: album.images.length > 0 ? album.images[0].url : null,
        }));

        // Return combined artist details, top tracks, and albums
        return {
            name: artistDetails.name,
            genres: artistDetails.genres.join(", "),
            popularity: artistDetails.popularity,
            followers: artistDetails.followers.total,
            imageUrl: artistDetails.images.length > 0 ? artistDetails.images[0].url : null,
            spotifyLink: artistDetails.external_urls.spotify,
            topTracks,
            albums
        };

    } catch (error) {
        console.log('Error getting artist details: ', error);
        return null;
    }
};



