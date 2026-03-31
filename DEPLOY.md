# Guía de Despliegue para IT - Calculadora Iris

## Pasos para el Despliegue

Sigue estos comandos en la terminal desde la raíz del proyecto:

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Compilar para Producción**:
    Genera una carpeta `dist/` con el código optimizado.
    ```bash
    npm run build
    ```

3.  **Servir la Aplicación**:
    Utiliza el comando ya configurado para levantar el servidor estático con soporte para Single Page Application (SPA).
    ```bash
    npm run serve:prod
    ```

## Notas Técnicas para IT

### Cambiar el Puerto
Por defecto, la aplicación se servirá en el puerto **3000** (o el siguiente disponible). Si necesitas especificar un puerto concreto, puedes usar:
```bash
npx serve -l 8080 -s dist
```

### Configuración del Servidor (Nginx/Apache)
Si prefieres usar un servidor web dedicado como Nginx o Apache, simplemente debes configurar el servidor para que apunte al directorio `dist/` y redirigir todas las peticiones internas al archivo `index.html`.

Ejemplo de configuración básica para **Nginx**:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/al/proyecto/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
