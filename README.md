# E-commerce Backend

## Instalación de Node.js o NVM (Node Version Manager)

Si se tiene instalado [Node.js](https://nodejs.org/) o [NVM](https://github.com/nvm-sh/nvm) en el sistema, se puede saltar este paso.

Para instalar Node.js, se debe ejecutar el siguiente comando:

```bash
sudo apt-get update

sudo apt-get install nodejs

# Para verificar la versión de Node.js
node -v
```

Si se desea instalar NVM, se deben ejecutar los siguientes comandos:

```bash
# Descargar e instalar nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Instalar la última versión de Node.js
nvm install node

# Verificar la instalación:
node -v

# Verificar la instalación de npm:
npm -v
```

## Instalar dependencias

Para instalar las dependencias, se debe ejecutar el siguiente comando:

```bash
npm install
```

## Configurar variables de entorno

Cree los archivos de entorno necesarios en la raíz del proyecto y añada las variables de entorno necesarias. Puede usar el archivo de ejemplo como referencia.

- Para entorno **local**:

  ```bash
  cp .env.example .env.local
  ```

- Para entorno de **desarrollo**:

  ```bash
  cp .env.example .env.development
  ```

- Para entorno de **producción**:

  ```bash
  cp .env.example .env
  ```

Edite los archivos `.env.local`, `.env.development` y `.env` con sus configuraciones.

## Ejecutar en local

Para iniciar el servidor en la máquina local y estas usando Windows como sistema operativo , ejecute:

```bash
# Modo normal
npm run start

# Modo watch
npm run start:dev:win
```

Si está usando Linux o MacOS, ejecute:

```bash
# Modo normal
npm run start

# Modo watch
npm run start:dev:linux
```

El servidor se ejecutará en `http://localhost:<PORT>` donde `<PORT>` es el puerto configurado en el archivo `.env.local`.
