import { abrirAside } from "../../../controllers/SettingMap/Search.js";


const asideInfo = document.getElementById('aside-info');
const closeButton = document.getElementById('close-aside');
const openButton = document.getElementById('open-aside');
const searchContainer = document.getElementById('searchContainer')
const searchInput =document.getElementById('search-input');
const direcBtn = document.getElementById('Direction');

const intro =  document.querySelector('.floating-box');
const nextBtn = document.querySelector('#Siguiente');
const offerBox = document.querySelector(".offer-box");

window.addEventListener('load', function() {
    feather.replace(); // Reemplaza los íconos de Feather


    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault(); // Evita que el enlace redirija automáticamente
            document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'; // Elimina la cookie
            document.location.href = "/login"; // Redirige a la página de login
        });
    }

    
    nextBtn.addEventListener("click", ()=>{
        intro.style.display = 'none';
        offerBox.style.display = 'initial';
    })
    const closeBtn = this.document.querySelector("#cerrar");
    const blur = this.document.querySelector(".blur-background")
    closeBtn.addEventListener("click",(event)=>{
        offerBox.style.display = "none"
        blur.style.display ="none";
        abrirAside(event);
        direcBtn.style.display = "none";
    });
    
});