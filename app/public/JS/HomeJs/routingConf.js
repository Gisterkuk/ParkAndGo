document.addEventListener('DOMContentLoaded', function() {

    const routingBtn = document.getElementById("Routing");
    const routingForm = document.getElementById('routingForm');
    const closeBtn = document.getElementById('close-routing');

    routingBtn.addEventListener("click",()=>{
        routingBtn.style.display ="none";
        routingForm.style.display='flex'
    });

    closeBtn.addEventListener('click',()=>{
        routingForm.style.display = 'none';
        routingBtn.style.display ="block";
    });
    



})