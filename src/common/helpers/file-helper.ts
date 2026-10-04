import { Types } from 'mongoose';

export function generateFileNameAndPath(ext: string, folder: string): string {
  const cleanFolder = folder.replace(/\/+$/, '');
  const safeExt = ext.startsWith('.') ? ext : ext ? `.${ext}` : '';

  const fileName = `${new Types.ObjectId().toString()}${safeExt}`;
  const path = `${cleanFolder}/${fileName}`;

  return path;
}
