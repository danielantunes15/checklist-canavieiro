// Inicializar ícones do Lucide
lucide.createIcons();

const perguntas = [
    "Freios de serviço", "Luzes/Sinalização", "Pneus/Rodas", 
    "Nível de Óleo", "Cinto de Segurança", "Extintor", 
    "Engate Reboque", "Mangueiras", "Para-brisa", "Vazamentos"
];

// Gerar Checklist
const container = document.getElementById('questions-container');
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

// Lógica de Liberação Automática
document.getElementById('checklist-form').addEventListener('change', () => {
    const ncs = document.querySelectorAll('input[value="NC"]:checked').length;
    const badge = document.getElementById('status-badge');
    
    if (ncs > 0) {
        badge.textContent = "NÃO LIBERADO";
        badge.className = "badge badge-bloqueado";
    } else {
        badge.textContent = "LIBERADO";
        badge.className = "badge badge-liberado";
    }
});

// Navegação entre Telas
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + screenId).style.display = 'block';
    
    // Atualiza ícones ativos na barra inferior
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Fecha sidebar se estiver aberta
    document.getElementById('sidebar').classList.remove('active');
}

// Menu Lateral
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('active');
};