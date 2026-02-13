// ... (mantenha as variáveis de áudio lá do topo) ...

// Função para passar rádio (NEXT)
window.handleNext = function() {
    if (isRadio) {
        // Se estiver no modo rádio, pula para a próxima rádio da lista carregada
        currentIdx = (currentIdx + 1) % radios.length;
        playRadioByIndex(currentIdx);
    } else if (mySongs.length > 0) {
        currentIdx = (currentIdx + 1) % mySongs.length;
        playMp3ByIndex(currentIdx);
    }
};

// Função para voltar rádio (PREV)
window.handlePrev = function() {
    if (isRadio) {
        currentIdx = (currentIdx - 1 + radios.length) % radios.length;
        playRadioByIndex(currentIdx);
    } else if (mySongs.length > 0) {
        currentIdx = (currentIdx - 1 + mySongs.length) % mySongs.length;
        playMp3ByIndex(currentIdx);
    }
};

function playRadioByIndex(index) {
    const r = radios[index];
    if (!r) return;
    audio.src = r.url_resolved;
    document.getElementById('track-title').innerText = r.name;
    document.getElementById('track-sub').innerText = r.state || "Brasil";
    document.getElementById('cd-cover').src = (r.favicon && r.favicon.length > 10) ? r.favicon : 'https://cdn-icons-png.flaticon.com/512/26/26433.png';
    audio.play();
}

function playMp3ByIndex(index) {
    const s = mySongs[index];
    if (!s) return;
    audio.src = URL.createObjectURL(s);
    document.getElementById('track-title').innerText = s.name;
    document.getElementById('track-sub').innerText = "MP3 Local";
    document.getElementById('cd-cover').src = 'https://www.pngall.com/wp-content/uploads/2/Vinyl-Record-PNG-Transparent-HD-Photo.png';
    audio.play();
}
