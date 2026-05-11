(function() {
    var urlApp = "https://script.google.com/macros/s/AKfycbxKYHhL6caVrF83jISARJlU2adlD6M-q2UqfGOxxQNO_fb6RoaHjLixBjA65a41jR6N/exec";

    function getEmail() {
        let userEmail = "";
        try {
            if (window.circleUser && window.circleUser.email) {
                userEmail = window.circleUser.email;
            } else {
                let liquidEmail = "{{ user.email }}";
                if (liquidEmail && liquidEmail.indexOf('{{') === -1) userEmail = liquidEmail;
            }
        } catch (e) {}
        return userEmail ? userEmail.toLowerCase().trim() : null;
    }

    function setupDraggable(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const savedX = localStorage.getItem('petX'), savedY = localStorage.getItem('petY');
        
        if (savedX && savedY) { 
            elmnt.style.left = savedX; 
            elmnt.style.top = savedY; 
            elmnt.style.bottom = 'auto'; 
            elmnt.style.right = 'auto';
        } else { 
            elmnt.style.bottom = "25px"; 
            elmnt.style.right = "25px"; 
        }

        const handle = elmnt.querySelector('.drag-handle') || elmnt;
        handle.onmousedown = dragMouseDown;
        handle.ontouchstart = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            pos3 = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            pos4 = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            let cx = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            let cy = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            pos1 = pos3 - cx; pos2 = pos4 - cy;
            pos3 = cx; pos4 = cy;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            elmnt.style.bottom = 'auto'; elmnt.style.right = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null; document.onmousemove = null;
            document.ontouchend = null; document.ontouchmove = null;
            localStorage.setItem('petX', elmnt.style.left);
            localStorage.setItem('petY', elmnt.style.top);
        }
    }

    window.togglePetWidget = function(e) {
        if (e) e.stopPropagation();
        const isMin = localStorage.getItem('petMinimized') === 'true';
        localStorage.setItem('petMinimized', !isMin);
        
        const cachedS = localStorage.getItem('userSaldo') || 0;
        const cachedB = localStorage.getItem('userBadge') || "Aprendiz Curiosa 🐾";
        renderizar({ encontrado: true, arrasas: cachedS, badge: cachedB });
    };

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start) + " Arrasas";
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    function renderizar(data) {
        let widget = document.getElementById('pet-floating-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'pet-floating-widget';
            document.body.appendChild(widget);
            setupDraggable(widget);
        }

        const isMinimized = localStorage.getItem('petMinimized') === 'true';
        const isAluna = data && data.encontrado;
        
        const valorNovo = isAluna ? parseInt(data.arrasas) : 0;
        const valorAnterior = parseInt(localStorage.getItem('userSaldo') || 0);

        if (isAluna) {
            localStorage.setItem('userSaldo', valorNovo);
            if(data.badge) localStorage.setItem('userBadge', data.badge);
        }

        if (isMinimized) {
            widget.innerHTML = `<div class="minimized-icon" onclick="togglePetWidget(event)">🐾</div>`;
        } else {
            const imgs = {
                "Aprendiz Curiosa 🐾": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Aprendiz.webp",
                "Mulher de Propósito ✨": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Mulher.webp",
                "Fera da Técnica 🎓": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Fera.webp",
                "Profissional que Arrasa 💼": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Prof.webp",
                "Embaixadora Pet Rocinha 👑": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Embaixadora.webp"
            };
            const badge = imgs[data?.badge] || imgs["Aprendiz Curiosa 🐾"];

            widget.innerHTML = `
                <div class="widget-container">
                    <div class="drag-handle">⠿</div>
                    <div class="widget-main-content" onclick="window.open('${isAluna ? "/dash_aluna" : "/sign_up"}', '_self')">
                        <img src="${badge}" class="widget-badge" ondragstart="return false">
                        <div class="widget-info">
                            <span class="widget-label">Saldo</span>
                            <span class="widget-value" id="pet-val">${valorAnterior} Arrasas</span>
                        </div>
                    </div>
                    <button class="btn-minimize" onclick="togglePetWidget(event)">✕</button>
                </div>
            `;
            
            const valEl = document.getElementById('pet-val');
            if (valEl) {
                if (valorNovo !== valorAnterior) {
                    animateValue(valEl, valorAnterior, valorNovo, 1500);
                } else {
                    valEl.innerText = valorNovo + " Arrasas";
                }
            }
        }
    }

    function iniciarWidget() {
        var email = getEmail();
        if (!email) return;
        
        var script = document.createElement('script');
        var saldoParaComparar = localStorage.getItem('userSaldo') || 0;
        script.src = urlApp + "?email=" + encodeURIComponent(email) + "&ultimoSaldo=" + saldoParaComparar + "&callback=receberDadosPet";
        document.body.appendChild(script);
        script.onload = function() { script.remove(); };
    }

    window.receberDadosPet = function(d) { renderizar(d); };
window.addEventListener('message', (event) => {
    if (event.data === 'REQUEST_EMAIL') {
        event.source.postMessage({ email: getEmail() }, event.origin);
    }
});

    
    const cachedS = localStorage.getItem('userSaldo') || 0;
    const cachedB = localStorage.getItem('userBadge') || "Aprendiz Curiosa 🐾";
    renderizar({ encontrado: true, arrasas: cachedS, badge: cachedB });

    setTimeout(iniciarWidget, 1000);
    setInterval(iniciarWidget, 45000);
})();