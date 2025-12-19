const Storage = {
    get: (key, def = []) => JSON.parse(localStorage.getItem(key)) || def,
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    
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
        
        let salvas = this.get('ssma_perguntas', []);

        // CORREÇÃO: Se as perguntas antigas forem apenas strings, ou se estiver vazio, limpa e carrega o padrão
        if (salvas.length === 0 || typeof salvas[0] === 'string') {
            this.data.perguntas = [
                { texto: "Sistema de Freios", obrigatoria: true },
                { texto: "Iluminação/Sinalização", obrigatoria: true },
                { texto: "Condição dos Pneus", obrigatoria: true },
                { texto: "Nível de Fluidos", obrigatoria: true },
                { texto: "Itens de Segurança", obrigatoria: true }
            ];
            this.save();
        } else {
            this.data.perguntas = salvas;
        }
    },

    save() {
        this.set('ssma_empresas', this.data.empresas);
        this.set('ssma_caminhoes', this.data.caminhoes);
        this.set('ssma_perguntas', this.data.perguntas);
        this.set('ssma_config', this.data.config);
    }
};