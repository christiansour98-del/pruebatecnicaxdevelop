## Como correr el proyecto

primero instalar las dependencias
despues correr el servidor de developer con el comando:

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

El proyecto tiene como raiz localhost:3000/login donde mediante el nombre de usuario admin@test.com contrasena 123456 se puede iniciar como administrador o usuario con user@test.com contrasena password123 esta pagina te llevara a localhost:3000/posts donde podra realizar las operaciones de post y put siempre y cuando se sea administrador de lo contrario no podra hacer nada.

Una vez logeado hay otras rutas por visitar que solo son accesibles si se esta logeado como localhost:3000/users?page=1 donde encontraran un listado de los usuarios con su respectivo role, busqueda y filtro por role, ademas este directorio permitira visitar los post de cada usuario y los comentarios dentro de los post asi como agregar a favoritos los post

otra de las rutas que requieren estar logeado como administrador o usuario es localhost:3000/books donde se podra hacer una busqueda de libros por titulo con filtrado por autor y por ano de publicacion.
