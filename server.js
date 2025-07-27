// server.js (Código Backend Correto)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 10000; // Porta compatível com o Render

// --- Substitua por suas chaves reais da API do Face++ ---
const FACE_API_KEY = 'rQ0Doe6R__jziSPbiJywwLG_oHFgIauB';
const FACE_API_SECRET = '01xOnE9f-ac7dqQK-xFphhiUrh9npLM4';
// ---------------------------------------------------------

const FACE_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota para análise facial
app.post('/analyze-face', async (req, res) => { // Endpoint correto é /analyze-face
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Dados da imagem (imageBase64) não fornecidos.' });
        }

        const formData = new FormData();
        formData.append('api_key', FACE_API_KEY);
        formData.append('api_secret', FACE_API_SECRET);
        formData.append('image_base64', imageBase64);
        formData.append('return_attributes', 'gender,age,smiling,emotion,beauty,skinstatus,facequality,blur,eyestatus,mouthstatus,eyegaze,headpose');
        formData.append('return_landmark', '0');

        console.log("Enviando requisição para Face++...");

        const response = await axios({
            method: 'post',
            url: FACE_API_URL,
            data: formData,
            headers: {
                ...formData.getHeaders()
            },
            timeout: 10000
        });

        console.log("Resposta recebida da Face++:", response.status);
        return res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro na função /analyze-face:", error.message);

        if (error.response) {
            console.error("Detalhes do erro da API do Face++:", error.response.status, error.response.data);
            return res.status(error.response.status || 500).json({
                error: 'Erro na API do Face++',
                message: error.response.data?.error_message || 'Erro desconhecido na API do Face++',
                details: error.response.data
            });
        } else if (error.request) {
            console.error("Erro de conexão com a API do Face++:", error.request);
            return res.status(503).json({
                error: 'Erro de conexão com a API do Face++',
                message: 'Não foi possível conectar à API do Face++. Tente novamente mais tarde.'
            });
        } else {
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
app.listen(PORT, '0.0.0.0', () => { // O Render exige escutar em 0.0.0.0
    console.log(`🚀 Servidor backend Glow Lab rodando na porta ${PORT}`);
});
