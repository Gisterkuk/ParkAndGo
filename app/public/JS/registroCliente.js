document.addEventListener("DOMContentLoaded", function() {
    const errorDiv = document.getElementById("error");
    const labelError = document.getElementById("labelerror");
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('error');
    const nombre = urlParams.get('nombre');
    const apellido = urlParams.get('apell');
    const clave = urlParams.get('clave');
    
    if (errorMessage === "El correo no cumple con los requisitos válidos!") {
        let email = document.getElementById("Email");
        let nom = document.getElementById("Nom");
        let apell = document.getElementById("Apell");
        let pass = document.getElementById("Pass");
        let correoconteiner = document.getElementById("Email");

        correoconteiner.style.borderBottom = '1px solid red'

        if (email) email.value = ""; // Asumir que `email` no debe mostrar un texto específico
        if (nom) nom.value = nombre;
        if (apell) apell.value = apellido;
        if (pass) pass.value = clave;
    }
    else if (errorMessage) {
        errorDiv.querySelector('label').textContent = errorMessage;
        errorDiv.style.display = 'block';
        errorDiv.style.borderBottom = '1px solid red';
        errorDiv.style.textAlign = 'center'; 
        labelError.style.fontSize = '13px';
    }

    
});