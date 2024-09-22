import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.cwd() + '/uploads', // Pasta onde o arquivo será salvo
        filename: (req, file, cb) => {
          // Utiliza o nome original do arquivo sem alteração
          return cb(null, file.originalname);
        },
      }),
      limits: {
        fileSize: 250 * 1024, // Limite de 250KB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException(
              'Somente arquivos de imagem são permitidos!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    console.log('File received:', file); // Verifica se o arquivo foi recebido
    return {
      message: 'Arquivo enviado com sucesso!',
      file,
    };
  }
}
