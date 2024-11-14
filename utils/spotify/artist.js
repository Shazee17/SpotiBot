import axios from 'axios';

// Function to search for an artist and get its ID
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
        return response.data.artists.items[0].id;
    } else {
        return null;
    }
};

// Function to get artist details
export const getArtistDetails = async (artistName, accessToken) => {
    try {
        const artistId = await getArtistId(artistName, accessToken);

        if (!artistId) {
            console.log("Artist not found");
            return null;
        }

        const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const artistDetails = artistResponse.data;

        const topTracksResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const topTracks = topTracksResponse.data.tracks.map(track => ({
            name: track.name,
            album: track.album.name,
            duration: (track.duration_ms / 60000).toFixed(2),
            spotifyLink: track.external_urls.spotify,
        }));

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
