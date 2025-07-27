const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 10000;

// --- Substitua por suas chaves reais da API do Face++ ---
const FACE_API_KEY = 'FRoC4Z5xk4J926AcaELJKsCQNDojRllF';
const FACE_API_SECRET = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJgDJHNAeFuaqfRufkGULTz6cgS9WIf1ZB0NN848jObDnpiY0sYJ9UuFe7JjdeHe3KSIdna3dJnyMek/t5vmnGJO3nmxgxM4o45HY6nmOsz0YhufLomU8k+BCFrgL9QsxIdpMjHZ6tzeBAkWd8t/jwHkbAErPpxl5PJKotjPlbzwIDAQAB';
// ---------------------------------------------------------

const FACE_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect';

// Middleware
app.use(cors()); // Permite requisições de qualquer origem (CORS)
app.use(express.json({ limit: '10mb' })); // Permite receber JSON no body (até 10MB)

// Rota para análise facial
app.post('/analyze-face', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Dados da imagem (imageBase64) não fornecidos.' });
        }

        // Prepara os dados do formulário para enviar à API do Face++
        const formData = new FormData();
        formData.append('api_key', FACE_API_KEY);
        formData.append('api_secret', FACE_API_SECRET);
        formData.append('image_base64', imageBase64); // Envia a imagem em base64
        // Solicita os atributos que queremos
        formData.append('return_attributes', 'gender,age,smiling,emotion,beauty,skinstatus,facequality,blur,eyestatus,mouthstatus,eyegaze,headpose');
        formData.append('return_landmark', '0'); // 0 para não retornar pontos faciais (opcional)

        console.log("Enviando requisição para Face++...");

        // Envia para a API do Face++
        const response = await axios({
            method: 'post',
            url: FACE_API_URL,
            data: formData,
            headers: {
                ...formData.getHeaders() // Importante: define o Content-Type correto para multipart/form-data
            },
            timeout: 10000 // Timeout de 10 segundos
        });

        console.log("Resposta recebida da Face++:", response.status);

        // Retorna os dados da API do Face++ para o frontend
        return res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro na função /analyze-face:", error.message);

        // Trata erros específicos da API do Face++
        if (error.response) {
            console.error("Detalhes do erro da API do Face++:", error.response.status, error.response.data);
            return res.status(error.response.status || 500).json({
                error: 'Erro na API do Face++',
                message: error.response.data?.error_message || 'Erro desconhecido na API do Face++',
                details: error.response.data // Inclui detalhes brutos da API
            });
        } else if (error.request) {
            // Erro de rede ou timeout
            console.error("Erro de conexão com a API do Face++:", error.request);
            return res.status(503).json({
                error: 'Erro de conexão com a API do Face++',
                message: 'Não foi possível conectar à API do Face++. Tente novamente mais tarde.'
            });
        } else {
            // Outro erro (ex: erro no código)
            console.error("Erro interno:", error.message);
            return res.status(500).json({
                error: 'Erro interno do servidor',
                message: error.message
            });
        }
    }
});

// Rota de health check
app.get('/', (req, res) => {
    res.json({ message: 'Servidor backend Glow Lab - Conectado ao Face++' });
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend Glow Lab rodando na porta ${PORT}`);
});