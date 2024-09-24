import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';

describe('UploadController (e2e)', () => {
    let app: INestApplication;
    const filePath = 'tests/test-image.jpg';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Verifica se a pasta 'tests' existe e a cria se necessário
        if (!fs.existsSync('tests')) {
            fs.mkdirSync('tests');
        }

        // Cria o arquivo de teste temporário
        fs.writeFileSync(filePath, 'Imagem de teste');
    });

    it('deve criar a pasta e salvar o arquivo', async () => {
        const companyId = 'test-company-id';

        const response = await request(app.getHttpServer())
            .post('/upload/file')
            .set('x-company-id', companyId)
            .attach('file', filePath);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Arquivo enviado com sucesso!');

        const fileExists = fs.existsSync(
            `${process.cwd()}/uploads/${companyId}/test-image.jpg`
        );
        expect(fileExists).toBe(true);
    });

    afterAll(async () => {
        await app.close();

        // Remove o arquivo de teste
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Verifica se a pasta existe antes de tentar removê-la
        const directoryPath = path.join(process.cwd(), 'uploads', 'test-company-id');
        if (fs.existsSync(directoryPath)) {
            fs.rmSync(directoryPath, { recursive: true, force: true });
        }
    });
});
