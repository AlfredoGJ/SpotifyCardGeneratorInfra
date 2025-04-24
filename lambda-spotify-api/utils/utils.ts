import { Album, Artist, SpotifyApi } from '@spotify/web-api-ts-sdk';
import {
    AlbumDto,
    ArtistDto,
    AccessToken,
    Track,
    SimplifiedAlbum,
    SimplifiedArtist,
    SimplifiedTrack,
    ImageSizes,
    ContentType,
    Scannable,
} from '../types/types';
import fs from 'fs';
const allowedScopes: string[] = ['playlist-read-private', 'playlist-read-collaborative'];

function getScanableCode(size: ImageSizes, type: ContentType, id: string): Scannable {
    return {
        uri: `${process.env.SPOTIFY_SCANABLES_URL_BASE}/${size}/spotify:${type}:${id}`,
        size: size,
    };
}

function getTrackDto(track: any): Track {
    const dto: Track = {
        duration_ms: track.duration_ms,
        id: track.id,
        name: track.name,
        artists: getSimplifiedArtists(track.artists),
        album: getSimplifiedAlbumDto(track.album),
        scannables: [
            getScanableCode(ImageSizes.Normal, ContentType.Track, track.id),
            getScanableCode(ImageSizes.Small, ContentType.Track, track.id),
        ],
    };

    return dto;
}

function getSimplifiedTrackDto(track: any) {
    const dto: SimplifiedTrack = {
        name: track.name,
        track_number: track.track_number,
        duration_ms: track.duration_ms,
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
        tracks: album.tracks.items.map((track) => getSimplifiedTrackDto(track)),
        label: album.label,
        scannables: [
            getScanableCode(ImageSizes.Normal, ContentType.Album, album.id),
            getScanableCode(ImageSizes.Small, ContentType.Album, album.id),
        ],
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

export { allowedScopes, getAlbumDto, getArtistDto, getTrackDto };
