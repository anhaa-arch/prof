import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.bucketName = this.configService.get('AWS_S3_BUCKET') || 'urcs-files';

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(
    workId: string,
    userId: string,
    file: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    },
  ) {
    // Generate unique file key
    const fileExt = file.filename.split('.').pop();
    const fileKey = `works/${workId}/${uuidv4()}.${fileExt}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Save file metadata to database
    const workFile = await this.prisma.workFile.create({
      data: {
        workId,
        fileKey,
        fileName: file.filename,
        contentType: file.mimetype,
        size: file.buffer.length,
        uploadedBy: userId,
      },
      include: {
        uploader: true,
      },
    });

    return workFile;
  }

  async getFileUrl(fileId: string, expiresIn = 3600): Promise<string> {
    const file = await this.prisma.workFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.fileKey,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    return url;
  }

  async deleteFile(fileId: string, userId: string, isAdmin = false) {
    const file = await this.prisma.workFile.findUnique({
      where: { id: fileId },
      include: { work: true },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Check permissions
    if (!isAdmin && file.uploadedBy !== userId && file.work.createdBy !== userId) {
      throw new Error('Permission denied');
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: file.fileKey,
    });

    await this.s3Client.send(command);

    // Delete from database
    await this.prisma.workFile.delete({
      where: { id: fileId },
    });

    return { success: true };
  }

  async getWorkFiles(workId: string) {
    return this.prisma.workFile.findMany({
      where: { workId },
      include: {
        uploader: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}

