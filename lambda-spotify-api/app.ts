import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAlbumDto, getTrackDto } from './utils/utils';
import { get } from './utils/api';
import { getToken } from './utils/auth';
import withHeaders from './utils/addHeaders';
import { configDotenv } from 'dotenv';

configDotenv()

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
                const track = await get('track',trackId, token!);
                console.log('Track From API', track);
                return withHeaders({
                    statusCode: 200,
                    body: JSON.stringify({ track: getTrackDto(track) }),
                });
            }
            if(event.queryStringParameters.albumId){
                const {albumId} = event.queryStringParameters
                const album = await get('album',albumId, token!);
                console.log('Album From API', albumId);
                return withHeaders({
                    statusCode:200,
                    body: JSON.stringify({album:getAlbumDto(album)})
                })
            }
            return withHeaders({
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Not implemented yet',
                }),
            });
        } catch (err) {
            console.log(err);
            return withHeaders({
                statusCode: 500,
                body: JSON.stringify({
                    message: `some error happened: ${err} `,
                }),
            });
        }
    } else {
        return withHeaders({
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing query parameters in request',
            }),
        });
    }
};
