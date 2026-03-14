import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  s3Client = new S3Client({ region: 'eu-west-3' });

  async UploadToS3(buffer: Buffer, fileName: string): Promise<string> {
    const bucketName = process.env.AWS_S3_AVATAR_BUCKET_NAME;
    const s3Key = `avatars/${uuidv4()}-${fileName}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  }
}
