import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs'; // Para verificar e criar pastas
import { join } from 'path'; // Para unir caminhos

@Controller('upload')
export class UploadController {
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const companyId = req.headers['x-company-id'];

          if (!companyId) {
            return cb(new BadRequestException('Company ID não fornecido.'), '');
          }

          const uploadPath = join(process.cwd(), 'uploads', companyId as string);

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
            console.log(`Pasta criada com o companyId: ${companyId}`);
          } else {
            console.log(`Pasta já existe para o companyId: ${companyId}`);
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      limits: {
        fileSize: 250 * 1024, // Limite de 250KB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Somente arquivos de imagem são permitidos!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    const companyId = req.headers['x-company-id'];

    if (!companyId) {
      throw new BadRequestException('Company ID não fornecido.');
    }

    // Gerar a URL pública de acesso ao arquivo
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${companyId}/${file.originalname}`;

    console.log('File received:', file);
    console.log('Company ID:', companyId);
    console.log('File URL:', fileUrl); // Verifique se a URL está correta

    return {
      message: 'Arquivo enviado com sucesso!',
      fileUrl, // Retorna a URL de acesso ao arquivo
    };
  }
}
