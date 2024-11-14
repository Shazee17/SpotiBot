import axios from 'axios';

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
        return response.data.tracks.items[0].id;
    } else {
        return null;
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
                seed_tracks: trackId, 
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return recommendations.data.tracks;
    } catch (error) {
        console.error('Error getting song recommendations:', error);
        return [];
    }
};

// Function to get details of a track
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
        });

        const trackDetails = response.data;

        return {
            name: trackDetails.name,
            album: trackDetails.album.name,
            artist: trackDetails.artists.map(artist => artist.name).join(", "),
            releaseDate: trackDetails.album.release_date,
            duration: (trackDetails.duration_ms / 60000).toFixed(2),
            previewUrl: trackDetails.preview_url,
            spotifyLink: trackDetails.external_urls.spotify,
            popularity: trackDetails.popularity,
            imageUrl: trackDetails.album.images[0]?.url
        };
        
    } catch (error) {
        console.error('Error getting track details:', error);
        return null;
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