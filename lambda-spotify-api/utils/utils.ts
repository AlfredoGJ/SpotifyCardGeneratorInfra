import { Album, Artist, SpotifyApi } from '@spotify/web-api-ts-sdk';
import {
    AlbumDto,
    ArtistDto,
    AccessToken,
    Track,
    SimplifiedAlbum,
    SimplifiedArtist,
    ImageSizes,
    ContentType,
    Scannable,
} from '../types/types';
import fs from 'fs';
const allowedScopes: string[] = ['playlist-read-private', 'playlist-read-collaborative'];

function isTokenExpired(token: AccessToken): boolean {
    const { issued_at, expires_in } = token;
    const issueDate = new Date(issued_at);
    const expirationDate = new Date(issueDate.getTime() + expires_in * 1000);
    const now = new Date();
    if (now < expirationDate) return false;
    return true;
}

function getScanableCode(size: ImageSizes, type: ContentType, id: string):Scannable {
    return {
        uri:`${process.env.SPOTIFY_SCANABLES_URL_BASE}/${size}/spotify:${type}:${id}`,
        size:size
    } 
}

function getTrackDto(track: any): Track {
    const dto: Track = {
        duration_ms: track.duration_ms,
        id: track.id,
        name: track.name,
        artists: getSimplifiedArtists(track.artists),
        album: getSimplifiedAlbumDto(track.album),
        scannables: [getScanableCode(ImageSizes.Normal,ContentType.Track, track.id), getScanableCode(ImageSizes.Small, ContentType.Track, track.id)]
    };

    return dto;
}
function getSimplifiedArtists(artists: any[]): SimplifiedArtist[] {
    const result: Array<SimplifiedArtist> = [];
    artists.map((artist: any) => {
        let a: SimplifiedArtist = {
            id: artist.id,
            name: artist.name,
            type: artist.type,
        };
        result.push(a);
    });
    return result;
}

function getSimplifiedAlbumDto(simplifiedAlbum: any): SimplifiedAlbum {
    const dto: SimplifiedAlbum = {
        id: simplifiedAlbum.id,
        name: simplifiedAlbum.name,
        release_date: simplifiedAlbum.release_date,
        total_tracks: simplifiedAlbum.total_tracks,
        images: simplifiedAlbum.images,
    };
    return dto;
}

function getAlbumDto(album: Album): AlbumDto {
    const dto: AlbumDto = {
        id: album.id,
        name: album.name,
        genres: album.genres,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        images: album.images,
        artists: album.artists.map((artist) => getArtistDto(artist)),
    };
    return dto;
}

function getArtistDto(artist: Artist): ArtistDto {
    const dto: ArtistDto = {
        id: artist.id,
        images: artist.images,
        name: artist.name,
        type: artist.type,
    };

    return dto;
}

async function Authenticate(): Promise<AccessToken | null> {
    console.log('Calling the authentication endpoint... ');
    const response = await fetch(process.env.SPOTIFY_AUTH_ENDPOINT!, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString(
                'base64',
            )}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    console.log('Response', response);
    if (response.ok) {
        const json = await response.json();
        const newToken: AccessToken = {
            issued_at: new Date().toISOString(),
            access_token: json.access_token,
            expires_in: json.expires_in,
        };
        console.log(`Authentication succesful, fresh new token is: ${newToken.access_token}`);
        return newToken;
    } else {
        console.log('Authentication was not succesful');
        return null;
    }
}

async function getToken(): Promise<AccessToken | null> {
    console.log('Checking if a token in storage exists...');
    if (fs.existsSync('/tmp/token.txt')) {
        console.log('Found token in storage');
        let token = JSON.parse(fs.readFileSync('/tmp/token.txt').toString());
        console.log('Checking if the token is still valid');

        if (!isTokenExpired(token as AccessToken)) {
            console.log(`The token is still valid, reusing token: ${(token as AccessToken).access_token}`);
            return token as AccessToken;
        } else {
            console.log('Token in storage has expired, getting a new one');
            const newToken = await Authenticate();
            if (newToken !== null) {
                console.log('Writing new token to storage...');
                fs.writeFileSync('/tmp/token.txt', JSON.stringify(newToken));
            }
            return null;
        }
    } else {
        console.log('No token in storage, getting a new one...');
        const newToken = await Authenticate();
        if (newToken !== null) {
            console.log('Writing new token to storage...');
            fs.writeFileSync('/tmp/token.txt', JSON.stringify(newToken), { flag: 'w+' });
            return newToken;
        }
        return null;
    }
}

export { allowedScopes, getAlbumDto, getArtistDto, getTrackDto, isTokenExpired, getToken };
