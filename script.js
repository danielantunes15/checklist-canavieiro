lucide.createIcons();

const Storage = {
    get: (key, def = []) => JSON.parse(localStorage.getItem(key)) || def,
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
};

let empresas = Storage.get('ssma_empresas');
let caminhoes = Storage.get('ssma_caminhoes');
let perguntas = Storage.get('ssma_perguntas', ["Sistema de Freios", "Iluminação/Sinalização", "Pneus", "Nível de Fluidos", "Segurança"]);
let config = Storage.get('ssma_config', { tecnico: "TÉCNICO BEL" });

// --- NAVEGAÇÃO ---
document.getElementById('btn-cadastro-toggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('submenu-cadastro').classList.toggle('active');
};
document.onclick = () => document.getElementById('submenu-cadastro').classList.remove('active');
document.getElementById('btn-config-user').onclick = () => showScreen('config');

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + id).style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    if(id.startsWith('cad-')) document.getElementById('btn-cadastro-toggle').classList.add('active');
    else if(document.getElementById('nav-'+id)) document.getElementById('nav-'+id).classList.add('active');

    if(id === 'home') renderQuestions();
    if(id === 'frota') renderFrota();
    if(id === 'cad-perguntas') renderListaPerguntas();
    if(id === 'cad-empresas') renderListaEmpresas();
    lucide.createIcons();
}

// --- DADOS ---
function salvarPerfil() {
    const nome = document.getElementById('input-tech-name').value.trim();
    if(nome) {
        config.tecnico = nome.toUpperCase();
        Storage.set('ssma_config', config);
        document.getElementById('display-name').textContent = config.tecnico;
        alert("Perfil salvo!");
    }
}

function cadastrarCaminhao() {
    const placa = document.getElementById('placa-caminhao').value.toUpperCase().trim();
    const emp = document.getElementById('select-empresa-cadastro').value;
    if(!placa || !emp) return alert("Preencha Placa e Unidade");

    caminhoes.push({
        placa, empresa: emp, status: 'AGUARDANDO',
        desc: document.getElementById('desc-caminhao').value,
        data: '', tecnico: ''
    });
    Storage.set('ssma_caminhoes', caminhoes);
    atualizarSelects();
    alert("Veículo salvo!");
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = perguntas.map((p, i) => `
        <div class="question-card">
            <p><strong>${p}</strong></p>
            <div class="options">
                <input type="radio" name="q${i}" id="q${i}c" value="C" checked>
                <label for="q${i}c" class="lbl-c">CONFORME</label>
                <input type="radio" name="q${i}" id="q${i}nc" value="NC">
                <label for="q${i}nc" class="lbl-nc">NÃO CONF.</label>
            </div>
        </div>
    `).join('');
}

document.getElementById('checklist-form').addEventListener('change', () => {
    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const badge = document.getElementById('status-badge');
    badge.textContent = ncs > 0 ? "BLOQUEADO" : "LIBERADO";
    badge.className = ncs > 0 ? "badge badge-bloqueado" : "badge badge-liberado";
});

function renderFrota() {
    const container = document.getElementById('frota-container');
    const busca = document.getElementById('search-frota')?.value.toLowerCase() || "";
    container.innerHTML = "";

    empresas.forEach(emp => {
        const vels = caminhoes.filter(c => c.empresa === emp && c.placa.toLowerCase().includes(busca));
        if (vels.length === 0) return;

        let html = `<div class="empresa-group"><span class="empresa-title">${emp}</span>`;
        vels.forEach(v => {
            const css = v.status === 'LIBERADO' ? 'badge-liberado' : (v.status === 'BLOQUEADO' ? 'badge-bloqueado' : 'badge-pendente');
            html += `
                <div class="veiculo-item action-card" onclick="iniciarChecklist('${v.placa}')">
                    <div class="veiculo-info">
                        <b>${v.placa}</b>
                        <small>${v.desc || ''}</small>
                        ${v.data ? `<div class="historico-mini">${v.data}</div>` : ''}
                    </div>
                    <span class="badge ${css}">${v.status}</span>
                </div>`;
        });
        container.innerHTML += html + `</div>`;
    });
}

function iniciarChecklist(placa) {
    const v = caminhoes.find(c => c.placa === placa);
    document.getElementById('modal-body').innerHTML = `
        <h3 style="margin-top:0;">Nova Inspeção</h3>
        <p>Veículo: <b>${placa}</b></p>
        <div class="modal-info-box">Última: ${v.data || 'Nenhuma'}<br>Técnico: ${v.tecnico || 'BEL'}</div>
    `;
    document.getElementById('modal-confirm').style.display = 'flex';
    document.getElementById('btn-modal-confirm').onclick = () => {
        document.getElementById('select-veiculo-checklist').value = placa;
        closeModal();
        showScreen('home');
    };
}

function closeModal() { document.getElementById('modal-confirm').style.display = 'none'; }

document.getElementById('checklist-form').onsubmit = (e) => {
    e.preventDefault();
    const placa = document.getElementById('select-veiculo-checklist').value;
    if (!placa) return alert("Selecione um veículo");

    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const res = ncs > 0 ? "BLOQUEADO" : "LIBERADO";
    const idx = caminhoes.findIndex(c => c.placa === placa);

    if (idx !== -1) {
        const dataH = new Date().toLocaleString('pt-BR');
        caminhoes[idx].status = res;
        caminhoes[idx].data = dataH;
        caminhoes[idx].tecnico = config.tecnico;
        Storage.set('ssma_caminhoes', caminhoes);
        
        gerarPDF(placa, res, dataH);
        
        alert("Inspeção Salva!");
        e.target.reset();
        showScreen('frota');
    }
};

function gerarPDF(placa, status, data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("SSMA - RELATÓRIO DE INSPEÇÃO", 10, 10);
    doc.text(`Veículo: ${placa}`, 10, 20);
    doc.text(`Status: ${status}`, 10, 30);
    doc.text(`Data: ${data}`, 10, 40);
    doc.text(`Técnico: ${config.tecnico}`, 10, 50);
    doc.save(`inspecao_${placa}.pdf`);
}

// Funções Auxiliares (Mesma lógica do original)
function cadastrarEmpresa() {
    const n = document.getElementById('nome-empresa').value.trim();
    if(n){ empresas.push(n); Storage.set('ssma_empresas', empresas); renderListaEmpresas(); atualizarSelects(); }
}
function renderListaEmpresas() {
    document.getElementById('lista-empresas-edit').innerHTML = empresas.map((e,i)=>`<div class="veiculo-item"><span>${e}</span><button onclick="empresas.splice(${i},1);Storage.set('ssma_empresas',empresas);renderListaEmpresas()" class="btn-delete"><i data-lucide="trash-2"></i></button></div>`).join('');
    lucide.createIcons();
}
function cadastrarPergunta() {
    const p = document.getElementById('nova-pergunta').value.trim();
    if(p){ perguntas.push(p); Storage.set('ssma_perguntas', perguntas); renderListaPerguntas(); }
}
function renderListaPerguntas() {
    document.getElementById('lista-perguntas-edit').innerHTML = perguntas.map((p,i)=>`<div class="veiculo-item"><span>${p}</span><button onclick="perguntas.splice(${i},1);Storage.set('ssma_perguntas',perguntas);renderListaPerguntas()" class="btn-delete"><i data-lucide="trash-2"></i></button></div>`).join('');
    lucide.createIcons();
}
function atualizarSelects() {
    const sE = document.getElementById('select-empresa-cadastro');
    const sV = document.getElementById('select-veiculo-checklist');
    if(sE) sE.innerHTML = '<option value="">Unidade...</option>' + empresas.map(e=>`<option value="${e}">${e}</option>`).join('');
    if(sV) sV.innerHTML = '<option value="">Veículo...</option>' + caminhoes.map(c=>`<option value="${c.placa}">${c.placa}</option>`).join('');
}

// Inicialização
document.getElementById('display-name').textContent = config.tecnico;
document.getElementById('input-tech-name').value = config.tecnico;
atualizarSelects();
showScreen('home');