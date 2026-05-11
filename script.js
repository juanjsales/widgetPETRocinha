(function() {
    // ⚠️ URL DO APP SCRIPT
    var urlApp = "https://script.google.com/macros/s/AKfycbxKYHhL6caVrF83jISARJlU2adlD6M-q2UqfGOxxQNO_fb6RoaHjLixBjA65a41jR6N/exec";

    // Função para capturar o e-mail de forma segura
    function getEmail() {
        let userEmail = "";
        try {
            if (window.circleUser && window.circleUser.email) {
                userEmail = window.circleUser.email;
            } else {
                let liquidEmail = "{{ user.email }}";
                if (liquidEmail && liquidEmail.indexOf('{{') === -1) {
                    userEmail = liquidEmail;
                }
            }
        } catch (e) {
            console.warn("Erro ao ler objeto de usuário.");
        }
        return userEmail ? userEmail.toLowerCase().trim() : null;
    }

    function iniciarWidget() {
        var email = getEmail();
        if (!email) {
            var widget = document.getElementById('pet-floating-widget');
            if (widget) widget.classList.add('hidden');
            return;
        }

        // Enviamos o saldo atual para o servidor comparar e decidir se deve "festejar"
        var ultimoSaldo = localStorage.getItem('userSaldo') || 0;
        
        var script = document.createElement('script');
        script.src = urlApp + "?email=" + encodeURIComponent(email) + 
                     "&ultimoSaldo=" + ultimoSaldo + 
                     "&callback=receberDadosPet";
        document.body.appendChild(script);
        script.onload = function() { script.remove(); };
    }

    window.receberDadosPet = function(data) {
        if (data && data.encontrado) {
            renderizar(data);
        } else {
            renderizar(null);
        }
    };

    function renderizar(data) {
        var widget = document.getElementById('pet-floating-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'pet-floating-widget';
            document.body.appendChild(widget);
        }

        var imgs = {
            "Aprendiz Curiosa 🐾": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Aprendiz.webp",
            "Mulher de Propósito ✨": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Mulher.webp",
            "Fera da Técnica 🎓": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Fera.webp",
            "Profissional que Arrasa 💼": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Prof.webp",
            "Embaixadora Pet Rocinha 👑": "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/Embaixadora.webp"
        };

        var isAluna = data && data.encontrado;
        var valor = isAluna ? parseInt(data.arrasas) : 0;
        var valorAnterior = parseInt(localStorage.getItem('userSaldo') || 0);
        var badgeNome = isAluna ? data.badge : "Aprendiz Curiosa 🐾";

        // Se o servidor marcar "festejar" ou detectarmos aumento manualmente
        if (isAluna && (data.festejar || valor > valorAnterior)) {
            festejar(valor);
        }

        localStorage.setItem('userSaldo', valor);
        localStorage.setItem('userBadge', badgeNome);

        var imgSrc = imgs[badgeNome] || imgs["Aprendiz Curiosa 🐾"];

        widget.innerHTML = `
            <div class="widget-content" onclick="window.open('${isAluna ? "/dash_aluna" : "/sign_up"}', '_self')">
                <img src="${imgSrc}" class="widget-badge" loading="lazy" onerror="this.src='${imgs["Aprendiz Curiosa 🐾"]}'">
                <div class="widget-info">
                    <span class="widget-label">${isAluna ? 'Meu Saldo' : 'Profissão Pet'}</span>
                    <span class="widget-value" id="counter-value">${valorAnterior} A$</span>
                </div>
            </div>
        `;

        if (isAluna && valor !== valorAnterior) {
            animateValue(document.getElementById('counter-value'), valorAnterior, valor, 2000);
        } else if (isAluna) {
            document.getElementById('counter-value').innerText = valor + " A$";
        }
    }

    function animateValue(obj, start, end, duration) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start) + " A$";
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    function festejar(novaPontuacao) {
        const lastShown = localStorage.getItem('lastConfettiScore');
        if (lastShown !== novaPontuacao.toString()) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 } });
            new Audio('https://actions.google.com/sounds/v1/ui/coin_drop.ogg').play().catch(() => {});

            const balloon = document.createElement('div');
            balloon.className = "pet-celebration-balloon";
            balloon.innerText = "Você ganhou Arrasas! 🚀";
            
            const widget = document.getElementById('pet-floating-widget');
            if (widget) widget.appendChild(balloon);
            
            localStorage.setItem('lastConfettiScore', novaPontuacao.toString());
            setTimeout(() => { if(balloon.parentNode) balloon.remove(); }, 4000);
        }
    }

    // CACHE IMEDIATO
    (function () {
        const cachedSaldo = localStorage.getItem('userSaldo');
        if (cachedSaldo) {
            renderizar({
                encontrado: true,
                arrasas: parseInt(cachedSaldo),
                badge: localStorage.getItem('userBadge') || "Aprendiz Curiosa 🐾"
            });
        }
    })();

    setTimeout(iniciarWidget, 1000);
    setInterval(iniciarWidget, 45000);
})();