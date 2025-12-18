// Inicializar ícones do Lucide
lucide.createIcons();

const perguntas = [
    "Freios de serviço", "Luzes/Sinalização", "Pneus/Rodas", 
    "Nível de Óleo", "Cinto de Segurança", "Extintor", 
    "Engate Reboque", "Mangueiras", "Para-brisa", "Vazamentos"
];

// Gerar Checklist Dinamicamente
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

// Lógica de Liberação (Atualiza ao mudar qualquer opção)
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
    // Esconde todas as seções
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    
    // Mostra a selecionada
    const target = document.getElementById('screen-' + screenId);
    if(target) target.style.display = 'block';
    
    // Atualiza estado visual da bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(screenId)) {
            btn.classList.add('active');
        }
    });
    
    // Fecha sidebar se estiver aberta
    document.getElementById('sidebar').classList.remove('active');
    
    // Rola para o topo
    window.scrollTo(0, 0);
}

// Controle do Menu Lateral
document.getElementById('menu-toggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('sidebar').classList.toggle('active');
};

// Fechar sidebar ao clicar fora dela
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});