import {GetObjectCommand, S3Client , PutObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import "dotenv/config";

const s3client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
    }
});

async function getObjectURL(key : string){
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
    })
    const url = await getSignedUrl(s3client, command);
    return url;
}

async function putObject(filename : string, mimeType : string) : Promise<string>{
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `images/${filename}`,
        ContentType: mimeType,
    })
    const url = await getSignedUrl(s3client, command , {expiresIn: 3600});
    return url;
}
export  { getObjectURL, putObject , s3client};