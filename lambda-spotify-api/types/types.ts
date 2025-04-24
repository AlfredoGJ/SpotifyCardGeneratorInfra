import { Artist, Album } from '@spotify/web-api-ts-sdk';

type AccessToken = {
    issued_at: string; // ISO String
    access_token: string;
    expires_in: number;
};

type SimplifiedArtist = {
    id: string;
    name: string;
    type: string;
};

type Image = {
    url: string;
    height: number;
    width: number;
};
type Scannable = {
    size: ImageSizes;
    uri: string;
};

enum ImageSizes {
    Normal = 640,
    Small = 300,
    Tiny = 64,
}

enum ContentType {
    Album = 'album',
    Track = 'track',
    Playlist = 'playlist',
    Artist = 'artist',
}

type ArtistDto = Pick<Artist, 'name' | 'id' | 'type' | 'images'>;
type AlbumDto = Pick<Album, 'name' | 'id' | 'genres' | 'release_date' | 'total_tracks' | 'images' | 'label'> & {
    artists: Array<ArtistDto>;
    tracks: Array<SimplifiedTrack>,
    scannables: Scannable[]
};
type SimplifiedAlbum = {
    name: string;
    id: string;
    release_date: string;
    total_tracks: number;
    images: Image[];
};
type Track = {
    name: string;
    id: string;
    duration_ms: number;
    artists: Array<SimplifiedArtist>;
    album: SimplifiedAlbum;
    scannables: Scannable[];
};

type SimplifiedTrack = {
    name: string;
    duration_ms: number;
    track_number: number;
};

export type { AccessToken, ArtistDto, AlbumDto, Track, SimplifiedAlbum, SimplifiedArtist, Scannable, SimplifiedTrack };
export { ImageSizes, ContentType };
