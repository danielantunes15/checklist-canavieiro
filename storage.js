const Storage = {
    get: (key, def = []) => JSON.parse(localStorage.getItem(key)) || def,
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    
    // Dados globais
    data: {
        empresas: [],
        caminhoes: [],
        perguntas: [],
        config: {}
    },

    load() {
        this.data.empresas = this.get('ssma_empresas');
        this.data.caminhoes = this.get('ssma_caminhoes');
        this.data.config = this.get('ssma_config', { tecnico: "TÉCNICO BEL" });
        this.data.perguntas = this.get('ssma_perguntas', [
            { texto: "Sistema de Freios", obrigatoria: true },
            { texto: "Iluminação/Sinalização", obrigatoria: true },
            { texto: "Pneus", obrigatoria: true }
        ]);
    },

    save() {
        this.set('ssma_empresas', this.data.empresas);
        this.set('ssma_caminhoes', this.data.caminhoes);
        this.set('ssma_perguntas', this.data.perguntas);
        this.set('ssma_config', this.data.config);
    }
};