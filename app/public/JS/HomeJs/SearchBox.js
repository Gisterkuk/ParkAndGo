document.addEventListener('DOMContentLoaded', function() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    const sugerencia = document.querySelector('#suggestions-container')
    
    console.log(sugerencia);
    searchBtn.addEventListener('click', (event) => {
      event.stopPropagation(); // Detiene la propagación para evitar que se active el evento del documento
      searchContainer.classList.toggle('expanded');
      sugerencia.classList.toggle('expanded');

      if (searchContainer.classList.contains('expanded')) {
        sugerencia.style.display = 'block';
        searchInput.style.display = "block";
        searchInput.focus(); // Enfocar en el input si se expande
        searchBtn.style.color = '#406ff3'
        setTimeout(()=>{
            searchInput.placeholder = 'Busca en el parque...'
        },200)
      } else {
        sugerencia.innerHTML = ''
        sugerencia.style.display = 'none';
        searchInput.value = '';
        searchContainer.style.borderRadius = '20px'
        searchInput.style.display = "none";
        searchBtn.style.color = '#6a778e'
        searchInput.placeholder = '';
      }
    });
  
    // Cierra el input si se hace clic fuera del contenedor
    document.addEventListener('click', (event) => {
      if (!searchContainer.contains(event.target)) {
        searchContainer.classList.remove('expanded');
        searchInput.style.display = "none";
        searchInput.value = '';
      }
    });

});
