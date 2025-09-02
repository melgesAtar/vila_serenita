const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const whatsappInput = document.getElementById('whatsapp');
const submitBtn = document.querySelector('.form-submit-button');

// Utils: URL params e cookies
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

function getGAClientId() {
    // _ga=GA1.2.123456789.987654321 -> gclientid: 123456789.987654321
    const ga = getCookie('_ga');
    if (!ga) return '';
    const match = ga.match(/GA\d+\.\d+\.(\d+\.\d+)/);
    return match ? match[1] : '';
}

function setValidState(input, isValid) {
    if (isValid) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }
}

// Funções puras para verificar validade sem efeitos visuais
function isValidNameValue(value) {
    const cleaned = value.trim().replace(/\s+/g, ' ');
    if (cleaned === '') return false;
    const parts = cleaned.split(' ').filter(p => p.length >= 2);
    if (parts.length < 2) return false;
    const letters = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/;
    return letters.test(cleaned);
}

function isValidEmailValue(value) {
    const v = value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(v);
}

function isValidWhatsappValue(value) {
    const v = value.trim();
    const regex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    return regex.test(v);
}

function validateName() {
    const value = nameInput.value.trim().replace(/\s+/g, ' ');
    if (value === '') {
        showError(nameInput, 'O nome é obrigatório.');
        setValidState(nameInput, false);
        return false;
    }

    // exige pelo menos nome e sobrenome (2 palavras com 2+ letras)
    const parts = value.split(' ').filter(p => p.length >= 2);
    if (parts.length < 2) {
        showError(nameInput, 'Informe nome e sobrenome.');
        setValidState(nameInput, false);
        return false;
    }

    // apenas letras, espaços, apóstrofo e hífen
    const letters = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/;
    if (!letters.test(value)) {
        showError(nameInput, 'Use apenas letras.');
        setValidState(nameInput, false);
        return false;
    }

    clearError(nameInput);
    setValidState(nameInput, true);
    return true;
}

function validateEmail() {
    const value = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value === '') {
        showError(emailInput, 'O e-mail é obrigatório.');
        setValidState(emailInput, false);
        return false;
    } else if (!regex.test(value)) {
        showError(emailInput, 'Insira um e-mail válido.');
        setValidState(emailInput, false);
        return false;
    } else {
        clearError(emailInput);
        setValidState(emailInput, true);
        return true;
    }
}


function validateWhatsapp() {
    const value = whatsappInput.value.trim();
    const regex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    if (value === '') {
        showError(whatsappInput, 'O Whatsapp é obrigatório.');
        setValidState(whatsappInput, false);
        return false;
    } else if (!regex.test(value)) {
        showError(whatsappInput, 'Número de WhatsApp inválido.');
        setValidState(whatsappInput, false);
        return false;
    } else {
        clearError(whatsappInput);
        setValidState(whatsappInput, true);
        return true;
    }
}


function showError(input, message) {
    const wrapper = input.closest('.form-field') || input.parentNode;
    let error = wrapper.querySelector('.error-message');
    if (!error) {
        error = document.createElement('span');
        error.className = 'error-message';
        wrapper.appendChild(error);
    }
    error.textContent = message;
}


function clearError(input) {
    const wrapper = input.closest('.form-field') || input.parentNode;
    const error = wrapper.querySelector('.error-message');
    if (error) error.remove();
}

function updateSubmitState() {
    // Não disparar erros visuais aqui; apenas calcular validade pura
    const okName = isValidNameValue(nameInput.value);
    const okEmail = isValidEmailValue(emailInput.value);
    const okWhatsapp = isValidWhatsappValue(whatsappInput.value);
    const allValid = okName && okEmail && okWhatsapp;
    if (submitBtn) {
        submitBtn.disabled = !allValid;
        submitBtn.classList.toggle('is-ready', allValid);
    }
}


[nameInput, emailInput, whatsappInput].forEach(input => {
    input.addEventListener('input', () => {
        if (input === nameInput) validateName();
        else if (input === emailInput) validateEmail();
        else if (input === whatsappInput) validateWhatsapp();
        updateSubmitState();
    });
});

[nameInput, emailInput, whatsappInput].forEach(input => {
    input.addEventListener('blur', () => {
        if (input === nameInput) validateName();
        else if (input === emailInput) validateEmail();
        else if (input === whatsappInput) validateWhatsapp();
        updateSubmitState();
    });
});


form.addEventListener('submit', function(e) {
    e.preventDefault();
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isWhatsappValid = validateWhatsapp();

    if (isNameValid && isEmailValid && isWhatsappValid) {
        const formParams = new URLSearchParams({
            nome: nameInput.value.trim(),
            email: emailInput.value.trim(),
            telefone: whatsappInput.value.trim(),
            utm_source: getUrlParam('utm_source') || 'Desconhecido',
            utm_medium: getUrlParam('utm_medium') || 'Desconhecido',
            utm_campaign: getUrlParam('utm_campaign') || 'Desconhecido',
            utm_content: getUrlParam('utm_content') || 'Desconhecido'
        });

        if (submitBtn) submitBtn.disabled = true;

        fetch('php/integracao-kommo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formParams.toString()
        })
        .then(async r => {
            const res = await r.json().catch(() => ({ status: 'error', message: 'JSON inválido' }));
            if (r.ok && res && res.status === 'success') {
                try {
                    if (navigator.sendBeacon) {
                        const params = new URLSearchParams({
                            nome: nameInput.value.trim(),
                            telefone: whatsappInput.value.trim()
                        });
                        navigator.sendBeacon('php/pixel-submit.php', params);
                    } else {
                        fetch('php/pixel-submit.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'keepalive': 'true' },
                            body: new URLSearchParams({
                                nome: nameInput.value.trim(),
                                telefone: whatsappInput.value.trim()
                            })
                        });
                    }
                } catch (e) { console.warn('Pixel submit falhou', e); }
                window.location.href = 'proximos-passos.html';
            } else {
                console.error('Erro ao enviar para Kommo', res);
                alert('Falha ao enviar. Verifique os dados e tente novamente.');
            }
        })
        .catch(() => {
            alert('Erro de rede ao enviar. Tente novamente.');
        })
        .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
        });
    }
});

whatsappInput.addEventListener('input', function() {
    let x = whatsappInput.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    whatsappInput.value = !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? '-' + x[3] : ''}`;
});

// estado inicial
updateSubmitState();
