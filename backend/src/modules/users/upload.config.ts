// backend/src/modules/users/upload.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const avatarUploadConfig = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    // ✅ Correction : utiliser .test() correctement
    const isValidExt = allowedTypes.test(extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype.toLowerCase());

    if (isValidExt && isValidMime) {
      return callback(null, true);
    } else {
      callback(new BadRequestException('Seules les images sont autorisées (jpeg, jpg, png, webp)') as any, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
};