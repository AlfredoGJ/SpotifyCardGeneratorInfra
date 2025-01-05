import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { allowedScopes } from './utils';
import { getToken, getTrackDto, isTokenExpired } from './utils/utils';
import { request } from 'https';
import { METHODS } from 'http';
import { getTrack } from './utils/api';

// const spotifySdk = SpotifyApi.withClientCredentials(process.env.CLIENT_ID!, process.env.CLIENT_SECRET!, allowedScopes);

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.queryStringParameters) {
        try {
            const token = await getToken();
            console.log('Access Token:', token);
            if (event.queryStringParameters.trackId) {
                const { trackId } = event.queryStringParameters;
                const track = await getTrack(trackId, token!);
                console.log("Track From API", track)
                return {
                    statusCode: 200,
                    body: JSON.stringify({ track: getTrackDto(track) }),
                };
            }
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Not implemented yet',
                }),
            };
        } catch (err) {
            console.log(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `some error happened: ${err} `,
                }),
            };
        }
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing query parameters in request',
            }),
        };
    }
};
