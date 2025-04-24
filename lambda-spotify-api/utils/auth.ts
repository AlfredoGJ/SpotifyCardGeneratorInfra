import { AccessToken } from '../types/types';
import { downloadJsonFromS3, uploadJsonToS3 } from './s3';

async function Authenticate(): Promise<AccessToken | null> {
    console.log('Calling the authentication endpoint... ');
    console.log('Endpoint: ', process.env.SPOTIFY_AUTH_ENDPOINT);
    console.log('Env Variables: ', JSON.stringify(process.env));
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

function isTokenExpired(token: AccessToken): boolean {
    const { issued_at, expires_in } = token;
    const issueDate = new Date(issued_at);
    const expirationDate = new Date(issueDate.getTime() + expires_in * 1000);
    const now = new Date();
    if (now < expirationDate) return false;
    return true;
}

async function getToken(): Promise<AccessToken | null> {
    const bucketName = 'dev-spotify-integration-bucket';
    console.log('Checking if a token in storage exists...');
    try {
        const token = await downloadJsonFromS3(bucketName!, '/tmp/token.txt');
        if (!token) {
            console.log('No token in storage, getting a new one...');
            const newToken = await Authenticate();
            if (newToken !== null) {
                console.log('Writing new token to storage...');
                uploadJsonToS3(bucketName!, '/tmp/token.txt', newToken);
            }
            return newToken;
        }

        console.log('Found token in storage');
        console.log(`Token in storage: ${(token as AccessToken).access_token}`);
        console.log('Checking if the token is still valid');

        if (!isTokenExpired(token as AccessToken)) {
            console.log(`The token is still valid, reusing token: ${(token as AccessToken).access_token}`);
            return token as AccessToken;
        } else {
            console.log('Token in storage has expired, getting a new one...');
            const newToken = await Authenticate();
            if (newToken !== null) {
                console.log('Writing new token to storage...');
                uploadJsonToS3(bucketName!, '/tmp/token.txt', newToken);
            }
            return null;
        }
    } catch (err) {
        console.log('Error while getting token: ', err);
        return null;
    }
}

export { Authenticate, getToken };
