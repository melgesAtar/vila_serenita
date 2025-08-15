const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const whatsappInput = document.getElementById('whatsapp');

function validateName() {
    const value = nameInput.value.trim();
    const regex = /^[A-Za-zÀ-ú\s]{2,}$/;
    if (value === '') {
        showError(nameInput, 'O nome é obrigatório.');
        return false;
    }else {
        clearError(nameInput);
        return true;
    }
}

function validateEmail() {
    const value = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value === '') {
        showError(emailInput, 'O e-mail é obrigatório.');
        return false;
    } else if (!regex.test(value)) {
        showError(emailInput, 'Insira um e-mail válido.');
        return false;
    } else {
        clearError(emailInput);
        return true;
    }
}


function validateWhatsapp() {
    const value = whatsappInput.value.trim();
    const regex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    if (value === '') {
        showError(whatsappInput, 'O Whatsapp é obrigatório.');
        return false;
    } else if (!regex.test(value)) {
        showError(whatsappInput, 'Número de WhatsApp inválido.');
        return false;
    } else {
        clearError(whatsappInput);
        return true;
    }
}


function showError(input, message) {
    const wrapper = input.closest('.form-field') || input.parentNode;
    input.style.borderColor = 'red';
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
    input.style.borderColor = '#B0B0B0';
    const error = wrapper.querySelector('.error-message');
    if (error) error.remove();
}


[nameInput, emailInput, whatsappInput].forEach(input => {
    input.addEventListener('input', () => {
        if (input === nameInput) validateName();
        else if (input === emailInput) validateEmail();
        else if (input === whatsappInput) validateWhatsapp();
    });
});

[nameInput, emailInput, whatsappInput].forEach(input => {
    input.addEventListener('blur', () => {
        if (input === nameInput) validateName();
        else if (input === emailInput) validateEmail();
        else if (input === whatsappInput) validateWhatsapp();
    });
});


form.addEventListener('submit', function(e) {
    e.preventDefault();
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isWhatsappValid = validateWhatsapp();

    if (isNameValid && isEmailValid && isWhatsappValid) {
        console.log('Formulário válido, pode enviar!');
        form.submit();
    }
});

whatsappInput.addEventListener('input', function() {
    let x = whatsappInput.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    whatsappInput.value = !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? '-' + x[3] : ''}`;
});
