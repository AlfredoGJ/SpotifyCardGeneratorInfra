import { AccessToken } from '../types/types';
import { getTrackDto } from './utils';

const basepath = process.env.SPOTIFY_API_BASE;

async function getTrack(trackId: string, token: AccessToken) {
    const response = await fetch(`${basepath}/tracks/${trackId}`, {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    else
        throw new Error("Error getting 'track' resource from the API")
}

export { getTrack };
