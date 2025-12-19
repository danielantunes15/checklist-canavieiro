const UI = {
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        document.getElementById('screen-' + id).style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        
        if(id.startsWith('cad-')) document.getElementById('btn-cadastro-toggle').classList.add('active');
        else if(document.getElementById('nav-'+id)) document.getElementById('nav-'+id).classList.add('active');

        if(id === 'home') this.renderChecklist();
        if(id === 'frota') this.renderFrota();
        if(id === 'cad-perguntas') this.renderListaPerguntas();
        if(id === 'cad-empresas') this.renderListaEmpresas();
        lucide.createIcons();
    },

    renderChecklist() {
        const container = document.getElementById('questions-container');
        container.innerHTML = Storage.data.perguntas.map((p, i) => `
            <div class="question-card">
                <p><strong ${p.obrigatoria ? 'data-required="*"' : ''}>${p.texto}</strong></p>
                <div class="options">
                    <input type="radio" name="q${i}" id="q${i}c" value="C">
                    <label for="q${i}c" class="lbl-c">CONFORME</label>
                    <input type="radio" name="q${i}" id="q${i}nc" value="NC">
                    <label for="q${i}nc" class="lbl-nc">NÃO CONF.</label>
                    ${!p.obrigatoria ? `
                        <input type="radio" name="q${i}" id="q${i}na" value="NA" checked>
                        <label for="q${i}na" class="lbl-na" style="grid-column: span 2; margin-top:5px;">NÃO SE APLICA</label>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    renderFrota() {
        const container = document.getElementById('frota-container');
        const busca = document.getElementById('search-frota')?.value.toLowerCase() || "";
        container.innerHTML = "";

        Storage.data.empresas.forEach(emp => {
            const vels = Storage.data.caminhoes.filter(c => c.empresa === emp && c.placa.toLowerCase().includes(busca));
            if (vels.length === 0) return;

            let html = `<div class="empresa-group"><span class="empresa-title">${emp}</span>`;
            vels.forEach(v => {
                const css = v.status === 'LIBERADO' ? 'badge-liberado' : (v.status === 'BLOQUEADO' ? 'badge-bloqueado' : 'badge-pendente');
                html += `
                    <div class="veiculo-item action-card" onclick="App.iniciarChecklist('${v.placa}')">
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
        lucide.createIcons();
    },

    renderListaPerguntas() {
        document.getElementById('lista-perguntas-edit').innerHTML = Storage.data.perguntas.map((p, i) => `
            <div class="veiculo-item">
                <div style="display:flex; flex-direction:column;">
                    <span>${p.texto}</span>
                    <small style="color:var(--text-muted)">${p.obrigatoria ? 'Obrigatória' : 'Opcional'}</small>
                </div>
                <button onclick="App.removerPergunta(${i})" class="btn-delete"><i data-lucide="trash-2"></i></button>
            </div>
        `).join('');
        lucide.createIcons();
    },

    renderListaEmpresas() {
        document.getElementById('lista-empresas-edit').innerHTML = Storage.data.empresas.map((e, i) => `
            <div class="veiculo-item"><span>${e}</span><button onclick="App.removerEmpresa(${i})" class="btn-delete"><i data-lucide="trash-2"></i></button></div>
        `).join('');
        lucide.createIcons();
    },

    atualizarSelects() {
        const sE = document.getElementById('select-empresa-cadastro');
        const sV = document.getElementById('select-veiculo-checklist');
        if(sE) sE.innerHTML = '<option value="">Unidade...</option>' + Storage.data.empresas.map(e=>`<option value="${e}">${e}</option>`).join('');
        if(sV) sV.innerHTML = '<option value="">Veículo...</option>' + Storage.data.caminhoes.map(c=>`<option value="${c.placa}">${c.placa}</option>`).join('');
    },

    closeModal() { document.getElementById('modal-confirm').style.display = 'none'; }
};