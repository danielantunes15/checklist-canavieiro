lucide.createIcons();

// Perguntas padrão para o sistema
const perguntasPadrao = [
    "Sistema de Freios", 
    "Iluminação/Sinalização", 
    "Condição dos Pneus", 
    "Nível de Fluidos", 
    "Itens de Segurança", 
    "Vazamentos Visíveis"
];

const Storage = {
    get: (key, defaultVal = []) => JSON.parse(localStorage.getItem(key)) || defaultVal,
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data))
};

// Carrega dados ou usa os padrões
let empresas = Storage.get('ssma_empresas');
let caminhoes = Storage.get('ssma_caminhoes');
let perguntas = Storage.get('ssma_perguntas');

// Se não houver perguntas salvas, carrega as pré-definidas
if (perguntas.length === 0) {
    perguntas = [...perguntasPadrao];
    Storage.set('ssma_perguntas', perguntas);
}

// --- NAVEGAÇÃO ---
document.getElementById('btn-cadastro-toggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('submenu-cadastro').classList.toggle('active');
};

document.onclick = () => document.getElementById('submenu-cadastro').classList.remove('active');

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + screenId).style.display = 'block';
    document.getElementById('submenu-cadastro').classList.remove('active');
    
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    if(screenId.startsWith('cad-')) {
        document.getElementById('btn-cadastro-toggle').classList.add('active');
    } else {
        const activeNav = document.getElementById('nav-' + screenId);
        if(activeNav) activeNav.classList.add('active');
    }

    if(screenId === 'home') renderQuestions();
    if(screenId === 'cad-perguntas') renderListaPerguntas();
    if(screenId === 'cad-empresas') renderListaEmpresas();
    if(screenId === 'frota') renderFrota();
    
    lucide.createIcons();
}

// --- GESTÃO DE DADOS ---
function cadastrarPergunta() {
    const txt = document.getElementById('nova-pergunta').value.trim();
    if(!txt) return;
    perguntas.push(txt);
    Storage.set('ssma_perguntas', perguntas);
    document.getElementById('nova-pergunta').value = "";
    renderListaPerguntas();
}

function renderListaPerguntas() {
    const container = document.getElementById('lista-perguntas-edit');
    container.innerHTML = perguntas.map((p, i) => `
        <div class="veiculo-item"><span>${p}</span>
        <button onclick="removerPergunta(${i})" class="btn-delete"><i data-lucide="trash-2"></i></button></div>
    `).join('');
    lucide.createIcons();
}

function removerPergunta(i) {
    perguntas.splice(i, 1);
    Storage.set('ssma_perguntas', perguntas);
    renderListaPerguntas();
}

function cadastrarEmpresa() {
    const nome = document.getElementById('nome-empresa').value.trim();
    if (!nome) return;
    empresas.push(nome);
    Storage.set('ssma_empresas', empresas);
    document.getElementById('nome-empresa').value = "";
    renderListaEmpresas();
    atualizarSelects();
}

function renderListaEmpresas() {
    const container = document.getElementById('lista-empresas-edit');
    container.innerHTML = empresas.map((e, i) => `
        <div class="veiculo-item"><span>${e}</span>
        <button onclick="removerEmpresa(${i})" class="btn-delete"><i data-lucide="trash-2"></i></button></div>
    `).join('');
    lucide.createIcons();
}

function removerEmpresa(i) {
    empresas.splice(i, 1);
    Storage.set('ssma_empresas', empresas);
    renderListaEmpresas();
    atualizarSelects();
}

function cadastrarCaminhao() {
    const placa = document.getElementById('placa-caminhao').value.toUpperCase().trim();
    const empresa = document.getElementById('select-empresa-cadastro').value;
    if (!placa || !empresa) return alert("Preencha placa e unidade");

    caminhoes.push({
        placa, empresa, status: 'AGUARDANDO',
        descricao: document.getElementById('desc-caminhao').value,
        dataUltimaVistoria: '', ultimoTecnico: ''
    });
    Storage.set('ssma_caminhoes', caminhoes);
    atualizarSelects();
    alert("Caminhão salvo!");
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = "";
    perguntas.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'question-card';
        div.innerHTML = `<p><strong>${p}</strong></p>
            <div class="options">
                <input type="radio" name="q${i}" id="q${i}c" value="C" checked>
                <label for="q${i}c" class="lbl-c">Conforme</label>
                <input type="radio" name="q${i}" id="q${i}nc" value="NC">
                <label for="q${i}nc" class="lbl-nc">Não Conf.</label>
            </div>`;
        container.appendChild(div);
    });
}

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
                        <span>${v.descricao}</span>
                        ${v.dataUltimaVistoria ? `<div class="historico-mini">${v.dataUltimaVistoria}</div>` : ''}
                    </div>
                    <span class="badge ${css}">${v.status === 'AGUARDANDO' ? 'PENDENTE' : v.status}</span>
                </div>`;
        });
        container.innerHTML += html + `</div>`;
    });
}

function iniciarChecklist(placa) {
    const v = caminhoes.find(c => c.placa === placa);
    document.getElementById('modal-body').innerHTML = `
        <h3>Nova Inspeção</h3>
        <p>Veículo: <b>${placa}</b></p>
        <div class="modal-info-box">Última: ${v.dataUltimaVistoria || 'Nenhuma'}<br>Responsável: ${v.ultimoTecnico || 'BEL'}</div>
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
        caminhoes[idx].status = res;
        caminhoes[idx].dataUltimaVistoria = new Date().toLocaleString('pt-BR');
        caminhoes[idx].ultimoTecnico = "TÉCNICO BEL";
        Storage.set('ssma_caminhoes', caminhoes);
        alert("Status Atualizado!");
        e.target.reset();
        showScreen('frota');
    }
};

function atualizarSelects() {
    const sE = document.getElementById('select-empresa-cadastro');
    const sV = document.getElementById('select-veiculo-checklist');
    if(sE) {
        sE.innerHTML = '<option value="">Unidade...</option>';
        empresas.forEach(e => sE.innerHTML += `<option value="${e}">${e}</option>`);
    }
    if(sV) {
        sV.innerHTML = '<option value="">Selecione o Veículo...</option>';
        caminhoes.forEach(c => sV.innerHTML += `<option value="${c.placa}">${c.placa}</option>`);
    }
}

// Inicialização total
atualizarSelects();
renderFrota();
renderQuestions();