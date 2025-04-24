import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({ region: process.env.AWS_REGION });

const streamToString = (stream: Readable): Promise<string> =>
    new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });

async function uploadFileToS3(bucketName: string, key: string, content: string) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: content,
    });

    await s3.send(command);
    console.log(`File uploaded successfully to ${bucketName}/${key}`);
}

async function downloadObjectFromS3(bucketName: string, key: string) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    try {
        const response = await s3.send(command);
        const stringObject = await streamToString(response.Body as Readable);
        return stringObject;
    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            console.error(`Error downloading file from S3: ${error}`);
            throw error;
        }
    }
}

async function uploadJsonToS3(bucketName: string, key: string, jsonContent: Record<any, any>) {
    const content = JSON.stringify(jsonContent, null, 2);
    await uploadFileToS3(bucketName, key, content);
}

async function downloadJsonFromS3(bucketName: string, key: string): Promise<Record<any, any> | null> {
    try {
        const content = await downloadObjectFromS3(bucketName, key);
        return JSON.parse(content as string);
    } catch (error: any) {
        return null;
    }
}

export { uploadJsonToS3, downloadJsonFromS3 };
