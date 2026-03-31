# Guía de Despliegue para IT - Calculadora Iris

## Proceso de Despliegue
Executa estes comandos dende a raíz do proxecto para xerar e servir a versión de produción:

1.  **Instalar dependencias**:
    ```
    npm install
    ```

2.  **Compilar para Produción**:
    ```
    npm run build
    ```

3.  **Servir en Produción**:
    Utiliza o servidor estático configurado para Single Page Applications (SPA).
    ```
    npm run serve:prod
    ```

## Notas Técnicas para o Servidor

### Cambio de Porto
Se necesitas cambiar o porto (por defecto 3000), edita o comando en `package.json` ou lánzao manualmente:
```
npx serve -l 8080 -s dist
```

### Configuración de Apache / Nginx
Para un rendemento óptimo detrás dun servidor web, apunta á carpeta `dist/` e asegura a redirección ao `index.html` para que o enrutamento SPA funcione correctamente.

**Exemplo Nginx:**
```nginx
server {
    listen 80;
    server_name calculadora.toldosgomez.com;
    root /var/www/calculadora-iris/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Persistencia de Datos
A aplicación utiliza **LocalStorage** (`tgm_calculos`). Se se realiza unha limpeza de caché agresiva ou se o usuario cambia de navegador, os datos non se sincronizarán. No futuro, recoméndase vincular cunha base de datos central.
