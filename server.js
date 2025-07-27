// ... Dentro da classe SmartMirror ...

async analyzeFace() {
    if (!this.isActive) {
        this.showMessage('Ative o espelho primeiro para analisar seu rosto');
        return;
    }
    if (this.isAnalyzing) {
        this.showMessage('Análise já em andamento...');
        return;
    }
    this.isAnalyzing = true;
    this.showLoading();
    this.showMessage('Capturando imagem e preparando análise...');

    try {
        // 1. Captura o frame atual do vídeo
        const video = this.cameraFeed;
        const canvas = this.captureCanvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 2. Converte o canvas para uma Data URL (base64)
        const dataUrl = canvas.toDataURL('image/jpeg');
        // Extrai apenas a parte base64 (remove o prefixo 'data:image/jpeg;base64,')
        const base64Image = dataUrl.split(',')[1];

        // 3. Prepara o payload JSON
        const payload = {
            imageBase64: base64Image
        };

        // 4. Envia para o backend REAL
        // --- CORREÇÃO PRINCIPAL ---
        const response = await fetch(`${this.backendUrl}/analyze-face`, { // <-- Endpoint correto
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // <-- Tipo de conteúdo correto
            },
            body: JSON.stringify(payload) // <-- Dados no formato JSON
        });
        // --------------------------

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({})); // Tenta pegar detalhes do erro
             throw new Error(`Erro na análise: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        this.hideLoading();
        this.isAnalyzing = false;
        
        // Verifica se a API do Face++ encontrou um rosto
        if (data.faces && data.faces.length > 0) {
             this.displayAnalysisResults(data); // Passa os dados reais da API
             this.showMessage('Análise facial concluída! Resultados disponíveis.');
        } else {
             this.showMessage('Nenhum rosto detectado na imagem. Tente novamente.');
             console.warn("Nenhum rosto detectado pela API do Face++:", data);
        }
        
    } catch (err) {
        console.error("Erro durante a análise:", err);
        this.hideLoading();
        this.isAnalyzing = false;
        this.showMessage(`Erro na análise: ${err.message}`);
        // Opcional: Fechar resultados anteriores em caso de erro
        this.hideAnalysisResults();
    }
}

// ... (restante da classe SmartMirror e outros scripts) ...
