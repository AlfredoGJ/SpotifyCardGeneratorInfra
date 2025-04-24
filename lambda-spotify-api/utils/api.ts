import { AccessToken } from '../types/types';

const basepath = process.env.SPOTIFY_API_BASE;

async function get(type: string, id: string, token: AccessToken) {
    const response = await fetch(`${basepath}/${type}s/${id}`, {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
    } else throw new Error(`Error getting '${type}' resource from the API`);
}

export { get };
