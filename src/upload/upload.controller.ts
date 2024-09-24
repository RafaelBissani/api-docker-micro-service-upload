// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UseInterceptors,
//   BadRequestException,
//   Req,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { UploadService } from './upload.service';
// import { Request } from 'express';
// import { existsSync, mkdirSync } from 'fs'; // Para verificar e criar pastas
// import { join } from 'path'; // Para unir caminhos

// @Controller('upload')
// export class UploadController {
//   constructor(private readonly uploadService: UploadService) {}

//   @Post('file')
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: diskStorage({
//         destination: process.cwd() + '/uploads', // Pasta onde o arquivo será salvo
//         filename: (req, file, cb) => {
//           // Utiliza o nome original do arquivo sem alteração
//           return cb(null, file.originalname);
//         },
//       }),
//       limits: {
//         fileSize: 250 * 1024, // Limite de 250KB
//       },
//       fileFilter: (req, file, cb) => {
//         if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
//           return cb(
//             new BadRequestException(
//               'Somente arquivos de imagem são permitidos!',
//             ),
//             false,
//           );
//         }
//         cb(null, true);
//       },
//     }),
//   )
//   async uploadFile(
//     @UploadedFile() file: Express.Multer.File,
//     @Req() req: Request,
//   ) {
//     if (!file) {
//       throw new BadRequestException('Nenhum arquivo foi enviado.');
//     }

//     // Aqui estamos verificando os campos de 'companyId' no form-data do body
//     const companyId = req.body['companyId']; // Tente acessar o 'companyId' como uma chave do body

//     // Verifica se o companyId foi recebido
//     if (!companyId) {
//       throw new BadRequestException('Company ID não fornecido.');
//     }

//     // Caminho da pasta a ser criada
//     const uploadPath = join(process.cwd(), 'uploads', companyId);
//     console.log('Aqui o destino correto para envio da imagem:', uploadPath);

//     // Verifica se a pasta já existe, se não, cria
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//       console.log(`Pasta criada com o companyId: ${companyId}`);
//     } else {
//       console.log(`Pasta já existe para o companyId: ${companyId}`);
//     }

//     console.log('File received:', file);
//     console.log('Company ID:', companyId); // Verifica se o companyId foi recebido corretamente

//     return {
//       message: 'Arquivo enviado com sucesso!',
//       file,
//       companyId, // Retorna o companyId como parte da resposta (opcional)
//     };
//   }
// }
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
import { UploadService } from './upload.service';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs'; // Para verificar e criar pastas
import { join } from 'path'; // Para unir caminhos

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Extrai o companyId dos headers
          const companyId = req.headers['x-company-id']; // Captura o header 'x-company-id'

          if (!companyId) {
            return cb(new BadRequestException('Company ID não fornecido.'), '');
          }

          // Caminho da pasta a ser criada dinamicamente
          const uploadPath = join(process.cwd(), 'uploads', companyId as string);

          // Verifica se a pasta já existe, se não, cria
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
            console.log(`Pasta criada com o companyId: ${companyId}`);
          } else {
            console.log(`Pasta já existe para o companyId: ${companyId}`);
          }

          cb(null, uploadPath); // Define o caminho correto da pasta no multer
        },
        filename: (req, file, cb) => {
          // Mantém o nome original do arquivo ou pode ser modificado conforme necessário
          cb(null, file.originalname);
        },
      }),
      limits: {
        fileSize: 250 * 1024, // Limite de 250KB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Somente arquivos de imagem são permitidos!'),
            false,
          );
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

    const companyId = req.headers['x-company-id']; // Verifica novamente no header se o companyId foi fornecido

    if (!companyId) {
      throw new BadRequestException('Company ID não fornecido.');
    }

    console.log('File received:', file);
    console.log('Company ID:', companyId); // Verifica se o companyId foi capturado corretamente

    return {
      message: 'Arquivo enviado com sucesso!',
      file,
      companyId, // Retorna o companyId como parte da resposta (opcional)
    };
  }
}
