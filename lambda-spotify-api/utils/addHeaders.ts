import { APIGatewayProxyResult } from 'aws-lambda';

function withHeaders(result: APIGatewayProxyResult): APIGatewayProxyResult {
    return {
        ...result,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
        },
    };
}

export default withHeaders;
