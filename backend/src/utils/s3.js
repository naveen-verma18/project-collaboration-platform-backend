import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const REGION = process.env.AWS_REGION;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
    console.error("S3 configuration error: Missing required environment variables", {
        hasRegion: !!REGION,
        hasAccessKey: !!ACCESS_KEY_ID,
        hasSecretKey: !!SECRET_ACCESS_KEY,
        hasBucket: !!BUCKET_NAME,
    });
}

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID || "",
        secretAccessKey: SECRET_ACCESS_KEY || "",
    },
});

const buildS3Error = (message) => {
    const error = new Error(message);
    error.status = 500;
    return error;
};

export const getUploadUrl = async (key, contentType) => {
    console.log("S3 getUploadUrl called", { key, contentType, bucket: BUCKET_NAME });

    if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
        throw buildS3Error("File storage is not configured. Please contact the administrator.");
    }

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error generating signed upload URL", error);
        throw buildS3Error("Failed to generate upload URL.");
    }
};

export const getDownloadUrl = async (key) => {
    console.log("S3 getDownloadUrl called", { key, bucket: BUCKET_NAME });

    if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
        throw buildS3Error("File storage is not configured. Please contact the administrator.");
    }

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error generating signed download URL", error);
        throw buildS3Error("Failed to generate download URL.");
    }
};
