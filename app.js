const App = {
    init() {
        Storage.load();
        this.bindEvents();
        UI.atualizarSelects();
        document.getElementById('display-name').textContent = Storage.data.config.tecnico;
        document.getElementById('input-tech-name').value = Storage.data.config.tecnico;
        UI.showScreen('home');
    },

    bindEvents() {
        document.getElementById('btn-cadastro-toggle').onclick = (e) => {
            e.stopPropagation();
            document.getElementById('submenu-cadastro').classList.toggle('active');
        };
        document.onclick = () => document.getElementById('submenu-cadastro').classList.remove('active');
        document.getElementById('btn-config-user').onclick = () => UI.showScreen('config');

        document.getElementById('checklist-form').onchange = () => {
            const hasNC = document.querySelector('input[value="NC"]:checked');
            const badge = document.getElementById('status-badge');
            badge.textContent = hasNC ? "BLOQUEADO" : "LIBERADO";
            badge.className = `badge ${hasNC ? 'badge-bloqueado' : 'badge-liberado'}`;
        };

        document.getElementById('checklist-form').onsubmit = (e) => this.finalizarChecklist(e);
    },

    salvarPerfil() {
        const nome = document.getElementById('input-tech-name').value.trim();
        if(nome) {
            Storage.data.config.tecnico = nome.toUpperCase();
            Storage.save();
            document.getElementById('display-name').textContent = Storage.data.config.tecnico;
            alert("Perfil atualizado!");
        }
    },

    cadastrarPergunta() {
        const texto = document.getElementById('nova-pergunta').value.trim();
        const obrigatoria = document.getElementById('pergunta-obrigatoria').checked;
        if(texto) {
            Storage.data.perguntas.push({ texto, obrigatoria });
            Storage.save();
            document.getElementById('nova-pergunta').value = "";
            UI.renderListaPerguntas();
        }
    },

    removerPergunta(i) {
        Storage.data.perguntas.splice(i, 1);
        Storage.save();
        UI.renderListaPerguntas();
    },

    cadastrarEmpresa() {
        const n = document.getElementById('nome-empresa').value.trim();
        if(n) {
            Storage.data.empresas.push(n);
            Storage.save();
            document.getElementById('nome-empresa').value = "";
            UI.renderListaEmpresas();
            UI.atualizarSelects();
        }
    },

    removerEmpresa(i) {
        Storage.data.empresas.splice(i, 1);
        Storage.save();
        UI.renderListaEmpresas();
        UI.atualizarSelects();
    },

    cadastrarCaminhao() {
        const placa = document.getElementById('placa-caminhao').value.toUpperCase().trim();
        const emp = document.getElementById('select-empresa-cadastro').value;
        if(!placa || !emp) return alert("Preencha Placa e Unidade");

        Storage.data.caminhoes.push({
            placa, empresa: emp, status: 'AGUARDANDO',
            desc: document.getElementById('desc-caminhao').value,
            data: '', tecnico: ''
        });
        Storage.save();
        UI.atualizarSelects();
        alert("Veículo salvo!");
    },

    iniciarChecklist(placa) {
        const v = Storage.data.caminhoes.find(c => c.placa === placa);
        document.getElementById('modal-body').innerHTML = `
            <h3>Nova Inspeção</h3>
            <p>Veículo: <b>${placa}</b></p>
            <div style="background:var(--bg); padding:10px; border-radius:10px; font-size:0.75rem;">Última: ${v.data || 'Nenhuma'}</div>
        `;
        document.getElementById('modal-confirm').style.display = 'flex';
        document.getElementById('btn-modal-confirm').onclick = () => {
            document.getElementById('select-veiculo-checklist').value = placa;
            UI.closeModal();
            UI.showScreen('home');
        };
    },

    finalizarChecklist(e) {
        e.preventDefault();
        const placa = document.getElementById('select-veiculo-checklist').value;
        if (!placa) return alert("Selecione um veículo");

        let pendente = false;
        Storage.data.perguntas.forEach((p, i) => {
            if(p.obrigatoria && !document.querySelector(`input[name="q${i}"]:checked`)) pendente = true;
        });
        if(pendente) return alert("Responda todos os itens obrigatórios!");

        const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
        const res = ncs > 0 ? "BLOQUEADO" : "LIBERADO";
        const idx = Storage.data.caminhoes.findIndex(c => c.placa === placa);

        if (idx !== -1) {
            const dataH = new Date().toLocaleString('pt-BR');
            Storage.data.caminhoes[idx].status = res;
            Storage.data.caminhoes[idx].data = dataH;
            Storage.data.caminhoes[idx].tecnico = Storage.data.config.tecnico;
            Storage.save();
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text("SSMA - RELATÓRIO", 10, 10);
            doc.text(`Veículo: ${placa} | Status: ${res}`, 10, 20);
            doc.text(`Data: ${dataH}`, 10, 30);
            doc.save(`checklist_${placa}.pdf`);
            
            alert("Inspeção Salva!");
            e.target.reset();
            UI.showScreen('frota');
        }
    }
};

App.init();