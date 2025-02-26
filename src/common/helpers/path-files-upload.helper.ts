import { v4 as uuid } from 'uuid';

export function generateFileNameAndPath(
  image: Express.Multer.File,
  folder: string,
): { path: string } {
  const fileName = `${uuid()}.${image.mimetype.split('/')[1]}`;
  const folderName = `/${folder}`;

  const path = `${folderName}/${fileName}`;
  return { path };
}
