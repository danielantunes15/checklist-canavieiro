const perguntas = [
    "Freios de serviço e estacionamento",
    "Luzes (Faróis, Setas, Ré)",
    "Pneus e Rodas",
    "Nível de óleo e fluídos",
    "Cintos de segurança",
    "Extintor de incêndio",
    "Engate do reboque",
    "Condição das mangueiras",
    "Limpeza do para-brisa",
    "Sinalização refletiva"
];

const container = document.getElementById('questions-container');
const statusBadge = document.getElementById('status-badge');

// Gerar perguntas dinamicamente
perguntas.forEach((pergunta, index) => {
    const div = document.createElement('div');
    div.className = 'question-card';
    div.innerHTML = `
        <p><strong>${index + 1}. ${pergunta}</strong></p>
        <div class="options">
            <input type="radio" name="q${index}" id="q${index}c" value="C" checked>
            <label for="q${index}c">Conforme</label>
            
            <input type="radio" name="q${index}" id="q${index}nc" value="NC">
            <label for="q${index}nc">Não Conforme</label>
        </div>
    `;
    container.appendChild(div);
});

// Lógica de verificação em tempo real
document.getElementById('checklist-form').addEventListener('change', () => {
    const todosRadios = document.querySelectorAll('input[type="radio"]:checked');
    let temNaoConforme = false;

    todosRadios.forEach(radio => {
        if (radio.value === 'NC') temNaoConforme = true;
    });

    if (temNaoConforme) {
        statusBadge.textContent = "Não Liberado";
        statusBadge.className = "badge badge-bloqueado";
    } else {
        statusBadge.textContent = "Liberado";
        statusBadge.className = "badge badge-liberado";
    }
});

// Menu Hambúrguer
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const closeMenu = document.getElementById('close-menu');

menuToggle.onclick = () => sidebar.classList.add('active');
closeMenu.onclick = () => sidebar.classList.remove('active');