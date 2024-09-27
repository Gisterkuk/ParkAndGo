export function SoloUsuarios(req,res,next){
    const cookies = req.headers.cookie;
    
    if (!cookies) {
        return res.redirect('/login'); // Redirige si no hay cookies
    }

    // Comprueba si la cookie 'jwt' existe
    const jwtCookie = cookies.split('; ').find(cookie => cookie.startsWith('jwt='));

    if (!jwtCookie) {
        return res.redirect('/login'); // Redirige si no hay token JWT
    }

    // Si la cookie JWT está presente, continúa con la siguiente función de middleware
    next();
}