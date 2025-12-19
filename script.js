lucide.createIcons();

const Storage = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data))
};

let empresas = Storage.get('ssma_empresas');
let caminhoes = Storage.get('ssma_caminhoes');

const perguntas = [
    "Sistema de Freios", "Iluminação/Sinalização", "Condição Pneus", 
    "Nível de Fluidos", "Itens de Segurança", "Vazamentos"
];

renderQuestions();
atualizarSelects();
renderFrota();

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + screenId).style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById('nav-' + screenId).classList.add('active');
    lucide.createIcons();
}

// Lógica do Modal Moderno
function iniciarChecklist(placa) {
    const veiculo = caminhoes.find(c => c.placa === placa);
    const ultimoTecnico = veiculo.ultimoTecnico || "Sem registro";
    const ultimaData = veiculo.dataUltimaVistoria || "Sem registro";

    const modal = document.getElementById('modal-confirm');
    const modalBody = document.getElementById('modal-body');
    const btnConfirm = document.getElementById('btn-modal-confirm');

    modalBody.innerHTML = `
        <p>Deseja iniciar inspeção no veículo <b>${placa}</b>?</p>
        <div class="modal-info-box">
            <small>Última: ${ultimaData}</small><br>
            <small>Responsável: ${ultimoTecnico}</small>
        </div>
    `;

    modal.style.display = 'flex';

    btnConfirm.onclick = () => {
        const select = document.getElementById('select-veiculo-checklist');
        select.value = placa;
        closeModal();
        showScreen('home');
        window.scrollTo(0,0);
    };
}

function closeModal() {
    document.getElementById('modal-confirm').style.display = 'none';
}

function togglePlacasExtras() {
    const tipo = document.getElementById('tipo-caminhao').value;
    document.getElementById('campos-placas-extras').style.display = (tipo !== 'Simples') ? 'flex' : 'none';
}

function cadastrarEmpresa() {
    const nome = document.getElementById('nome-empresa').value.trim();
    if (!nome) return;
    empresas.push(nome);
    Storage.set('ssma_empresas', empresas);
    document.getElementById('nome-empresa').value = "";
    atualizarSelects();
    alert("Unidade salva!");
}

function cadastrarCaminhao() {
    const desc = document.getElementById('desc-caminhao').value;
    const placa = document.getElementById('placa-caminhao').value.toUpperCase();
    const empresa = document.getElementById('select-empresa-cadastro').value;

    if (!placa || !empresa) return alert("Placa e Unidade são obrigatórios");

    caminhoes.push({
        placa, descricao: desc, empresa, status: 'AGUARDANDO',
        tipo: document.getElementById('tipo-caminhao').value,
        placasExtras: [document.getElementById('placa-reboque-1').value, document.getElementById('placa-reboque-2').value],
        dataUltimaVistoria: '',
        ultimoTecnico: ''
    });
    
    Storage.set('ssma_caminhoes', caminhoes);
    atualizarSelects();
    renderFrota();
    alert("Veículo cadastrado!");
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

document.getElementById('checklist-form').addEventListener('change', () => {
    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const badge = document.getElementById('status-badge');
    badge.textContent = ncs > 0 ? "BLOQUEADO" : "LIBERADO";
    badge.className = ncs > 0 ? "badge badge-bloqueado" : "badge badge-liberado";
});

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
        renderFrota();
        alert("Status Atualizado!");
        e.target.reset();
        document.getElementById('status-badge').className = "badge badge-pendente";
        document.getElementById('status-badge').textContent = "AGUARDANDO";
        showScreen('frota');
    }
};

function renderFrota() {
    const container = document.getElementById('frota-container');
    const busca = document.getElementById('search-frota').value.toLowerCase();
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

function atualizarSelects() {
    const sE = document.getElementById('select-empresa-cadastro');
    const sV = document.getElementById('select-veiculo-checklist');
    sE.innerHTML = '<option value="">Selecione a Unidade</option>';
    empresas.forEach(e => sE.innerHTML += `<option value="${e}">${e}</option>`);
    sV.innerHTML = '<option value="">Selecione o Veículo...</option>';
    caminhoes.forEach(c => sV.innerHTML += `<option value="${c.placa}">${c.placa}</option>`);
}