import axios from 'axios';

// Function to search for an album and get its ID
export const getAlbumId = async (albumName, accessToken) => {
    const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
            q: albumName,
            type: 'album',
            limit: 1,
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (response.data.albums.items.length > 0) {
        return response.data.albums.items[0].id;
    } else {
        return null;
    }
};


// Function to get album details and tracks
export const getAlbumDetails = async (albumName, accessToken) => {
  try {
    const albumId = await getAlbumId(albumName, accessToken);

    if (!albumId) {
      console.log("Album not found");
      return null;
    }

    // Fetch album details
    const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const albumDetails = albumResponse.data;

    // Fetch tracks in the album
    const tracksResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        params: {
            limit: 10
        },
      
        headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tracks = tracksResponse.data.items;

    // Return both album details and tracks
    return {
      album: {
        name: albumDetails.name,
        artist: albumDetails.artists.map(artist => artist.name).join(', '),
        releaseDate: albumDetails.release_date,
        totalTracks: albumDetails.total_tracks,
        imageUrl: albumDetails.images[0]?.url,
        spotifyLink: albumDetails.external_urls.spotify,
      },
      tracks: tracks.map(track => ({
        name: track.name,
        duration: track.duration_ms, // Duration in milliseconds
        spotifyLink: track.external_urls.spotify,
      })),
    };
  } catch (error) {
    console.error('Error fetching album details or tracks:', error);
    return null;
  }
};

