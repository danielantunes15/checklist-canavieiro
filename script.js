lucide.createIcons();

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

// --- LÓGICA DE CADASTRO ---

// Exibe/Oculta campos de placas extras baseado no tipo
function togglePlacasExtras() {
    const tipo = document.getElementById('tipo-caminhao').value;
    const containerExtras = document.getElementById('campos-placas-extras');
    
    if (tipo === 'Rodotrem' || tipo === 'Treminhão') {
        containerExtras.style.display = 'flex';
    } else {
        containerExtras.style.display = 'none';
    }
}

function cadastrarEmpresa() {
    const nome = document.getElementById('nome-empresa').value.trim();
    if (!nome) return alert("Digite o nome da empresa");
    empresas.push(nome);
    localStorage.setItem('biocheck_empresas', JSON.stringify(empresas));
    document.getElementById('nome-empresa').value = "";
    atualizarSelects();
    alert("Empresa salva!");
}

function cadastrarCaminhao() {
    const descricao = document.getElementById('desc-caminhao').value.trim();
    const tipo = document.getElementById('tipo-caminhao').value;
    const placaPrincipal = document.getElementById('placa-caminhao').value.toUpperCase().trim();
    const placaR1 = document.getElementById('placa-reboque-1').value.toUpperCase().trim();
    const placaR2 = document.getElementById('placa-reboque-2').value.toUpperCase().trim();
    const empresa = document.getElementById('select-empresa-cadastro').value;
    
    if (!placaPrincipal || !empresa || !descricao) return alert("Preencha descrição, placa e empresa!");

    const novoVeiculo = {
        descricao,
        tipo,
        placa: placaPrincipal,
        placasExtras: (tipo !== 'Simples') ? [placaR1, placaR2] : [],
        empresa,
        status: 'AGUARDANDO'
    };
    
    caminhoes.push(novoVeiculo);
    localStorage.setItem('biocheck_caminhoes', JSON.stringify(caminhoes));
    
    // Limpar campos
    document.getElementById('desc-caminhao').value = "";
    document.getElementById('placa-caminhao').value = "";
    document.getElementById('placa-reboque-1').value = "";
    document.getElementById('placa-reboque-2').value = "";
    
    atualizarSelects();
    renderFrota();
    alert(`Veículo ${tipo} cadastrado com sucesso!`);
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

document.getElementById('checklist-form').addEventListener('change', () => {
    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const badge = document.getElementById('status-badge');
    badge.textContent = ncs > 0 ? "BLOQUEADO" : "LIBERADO";
    badge.className = ncs > 0 ? "badge badge-bloqueado" : "badge badge-liberado";
});

document.getElementById('checklist-form').onsubmit = (e) => {
    e.preventDefault();
    const placaSelecionada = document.getElementById('select-veiculo-checklist').value;
    if (!placaSelecionada) return alert("Selecione um veículo!");

    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const resultado = ncs > 0 ? "BLOQUEADO" : "LIBERADO";

    const index = caminhoes.findIndex(c => c.placa === placaSelecionada);
    if (index !== -1) {
        caminhoes[index].status = resultado;
        localStorage.setItem('biocheck_caminhoes', JSON.stringify(caminhoes));
        renderFrota();
        alert("Status atualizado!");
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
        const veiculos = caminhoes.filter(c => c.empresa === emp);
        if (veiculos.length === 0) return;

        let html = `<div class="empresa-group"><span class="empresa-title">${emp}</span>`;
        veiculos.forEach(v => {
            let statusClass = v.status === 'LIBERADO' ? 'badge-liberado' : (v.status === 'BLOQUEADO' ? 'badge-bloqueado' : 'badge-pendente');
            
            // Texto das placas extras se houver
            let placasExtrasTexto = v.placasExtras && v.placasExtras.length > 0 
                ? `<span class="placas-container">Reboques: ${v.placasExtras.join(' | ')}</span>` 
                : '';

            html += `
                <div class="veiculo-item">
                    <div class="veiculo-info">
                        <b>${v.placa}</b>
                        <small>${v.descricao} (${v.tipo})</small>
                        ${placasExtrasTexto}
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
    caminhoes.forEach(c => selVeiculo.innerHTML += `<option value="${c.placa}">${c.placa} - ${c.descricao}</option>`);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + screenId).style.display = 'block';
    document.querySelectorAll('.nav-item, .nav-link').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sidebar').classList.remove('active');
    lucide.createIcons();
}

document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('active');