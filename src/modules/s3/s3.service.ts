import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ListObjectsCommand,
  ListObjectsOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION as string,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(image: Express.Multer.File, path: string) {
    try {
      if (!image.buffer)
        throw new BadRequestException('Buffer de imagen no proporcionado');

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: path,
        Body: image.buffer,
        ContentType: image.mimetype,
      });
      await this.s3Client.send(command);

      return `/${path}`;
    } catch (error) {
      console.error('Error al subir el archivo a S3:', error);
      throw new HttpException('Error al guardar la imagen', 503);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: key.replace(/^\//, ''),
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error al eliminar el archivo de S3:', error);
      throw new HttpException('Error al eliminar el archivo', 503);
    }
  }

  private async getObjectsInFolder(
    folderPath: string,
  ): Promise<ListObjectsOutput> {
    const command = new ListObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Prefix: folderPath,
    });

    const response = await this.s3Client.send(command);
    return response;
  }

  private async deleteFolder(folderPath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: folderPath,
    });

    await this.s3Client.send(command);
  }

  async deleteFiles(path: string): Promise<void> {
    const folderPath = `/${path}/`;

    try {
      const objectsInFolder = await this.getObjectsInFolder(folderPath);

      if (!objectsInFolder.Contents) return;

      if (objectsInFolder.Contents.length > 0) {
        // Elimina los objetos de la carpeta de forma asíncrona
        await Promise.all(
          objectsInFolder.Contents.map(async (object) => {
            await this.deleteFile(object.Key!);
          }),
        );
      }

      // Elimina la carpeta principal de la tienda
      await this.deleteFolder(folderPath);
    } catch (error) {
      console.error('Error al eliminar archivos de la tienda:', error);
      throw new HttpException('Error al eliminar archivos de la tienda', 503);
    }
  }
}
