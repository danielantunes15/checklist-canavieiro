lucide.createIcons();

// Banco de dados no LocalStorage
let empresas = JSON.parse(localStorage.getItem('biocheck_empresas')) || [];
let caminhoes = JSON.parse(localStorage.getItem('biocheck_caminhoes')) || [];

const perguntas = [
    "Sistema de Freios", "Iluminação/Sinalização", "Condição dos Pneus", 
    "Nível de Fluidos", "Itens de Segurança", "Vazamentos Visíveis"
];

// Inicialização
renderQuestions();
atualizarSelects();
renderFrota();

// --- CADASTROS ---
function cadastrarEmpresa() {
    const nome = document.getElementById('nome-empresa').value.trim();
    if (!nome) return alert("Digite o nome da empresa");
    
    empresas.push(nome);
    localStorage.setItem('biocheck_empresas', JSON.stringify(empresas));
    document.getElementById('nome-empresa').value = "";
    atualizarSelects();
    alert("Empresa salva com sucesso!");
}

function cadastrarCaminhao() {
    const placa = document.getElementById('placa-caminhao').value.toUpperCase().trim();
    const empresa = document.getElementById('select-empresa-cadastro').value;
    
    if (!placa || !empresa) return alert("Informe a placa e a empresa");
    
    // REGRA SOLICITADA: Inicia como AGUARDANDO VISTORIA
    caminhoes.push({ placa, empresa, status: 'AGUARDANDO' });
    localStorage.setItem('biocheck_caminhoes', JSON.stringify(caminhoes));
    document.getElementById('placa-caminhao').value = "";
    
    atualizarSelects();
    renderFrota();
    alert("Veículo cadastrado e aguardando vistoria!");
}

// --- CHECKLIST ---
function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = "";
    perguntas.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'question-card';
        div.innerHTML = `
            <p><strong>${p}</strong></p>
            <div class="options">
                <input type="radio" name="q${i}" id="q${i}c" value="C" checked>
                <label for="q${i}c" class="lbl-c">Conforme</label>
                <input type="radio" name="q${i}" id="q${i}nc" value="NC">
                <label for="q${i}nc" class="lbl-nc">Não Conf.</label>
            </div>
        `;
        container.appendChild(div);
    });
}

// Atualizar o Badge visual do formulário
document.getElementById('checklist-form').addEventListener('change', () => {
    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const badge = document.getElementById('status-badge');
    
    if (ncs > 0) {
        badge.textContent = "BLOQUEADO";
        badge.className = "badge badge-bloqueado";
    } else {
        badge.textContent = "LIBERADO";
        badge.className = "badge badge-liberado";
    }
});

// Salvar a vistoria e mudar o status do caminhão
document.getElementById('checklist-form').onsubmit = (e) => {
    e.preventDefault();
    const placaSelecionada = document.getElementById('select-veiculo-checklist').value;
    if (!placaSelecionada) return alert("Selecione um veículo da lista!");

    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const resultadoFinal = ncs > 0 ? "BLOQUEADO" : "LIBERADO";

    const index = caminhoes.findIndex(c => c.placa === placaSelecionada);
    if (index !== -1) {
        caminhoes[index].status = resultadoFinal;
        localStorage.setItem('biocheck_caminhoes', JSON.stringify(caminhoes));
        
        renderFrota();
        alert(`Vistoria Concluída! Veículo ${placaSelecionada} agora está ${resultadoFinal}.`);
        
        // Resetar formulário
        e.target.reset();
        document.getElementById('status-badge').className = "badge badge-pendente";
        document.getElementById('status-badge').textContent = "AGUARDANDO";
    }
};

// --- INTERFACE ---
function renderFrota() {
    const container = document.getElementById('frota-container');
    container.innerHTML = "";

    empresas.forEach(emp => {
        const veiculosDaEmpresa = caminhoes.filter(c => c.empresa === emp);
        if (veiculosDaEmpresa.length === 0) return;

        let html = `<div class="empresa-group"><span class="empresa-title">${emp}</span>`;
        veiculosDaEmpresa.forEach(v => {
            let statusClass = 'badge-pendente';
            if(v.status === 'LIBERADO') statusClass = 'badge-liberado';
            if(v.status === 'BLOQUEADO') statusClass = 'badge-bloqueado';

            html += `
                <div class="veiculo-item">
                    <div class="veiculo-info">
                        <b>${v.placa}</b>
                    </div>
                    <span class="badge ${statusClass}">${v.status === 'AGUARDANDO' ? 'PENDENTE' : v.status}</span>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML += html;
    });
}

function atualizarSelects() {
    const selEmpresa = document.getElementById('select-empresa-cadastro');
    const selVeiculo = document.getElementById('select-veiculo-checklist');
    
    selEmpresa.innerHTML = '<option value="">Selecione a Empresa</option>';
    empresas.forEach(e => selEmpresa.innerHTML += `<option value="${e}">${e}</option>`);

    selVeiculo.innerHTML = '<option value="">Selecione o Veículo...</option>';
    caminhoes.forEach(c => selVeiculo.innerHTML += `<option value="${c.placa}">${c.placa}</option>`);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + screenId).style.display = 'block';
    
    document.querySelectorAll('.nav-item, .nav-link').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sidebar').classList.remove('active');
    lucide.createIcons();
}

document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('active');