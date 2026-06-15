# Carpeta de imágenes

Coloca aquí las imágenes institucionales del proyecto ITAM, por ejemplo:

- `logo-usac.png` — Logo oficial de la Universidad de San Carlos de Guatemala.
- `logo-fiusac.png` — Logo de la Facultad de Ingeniería.
- `logo-ecys.png` — Logo de la Escuela de Ciencias y Sistemas.
- `login-bg.jpg` — Imagen de fondo para la pantalla de inicio de sesión (opcional).

## Cómo se usan en el código

Estos archivos se referencian con rutas absolutas desde la carpeta `public`,
por ejemplo:

```jsx
<img src="/images/logo-usac.png" alt="Logo USAC" />
```

Si el archivo no existe todavía, los componentes muestran automáticamente un
ícono de respaldo (SVG en línea), por lo que la aplicación funciona
correctamente mientras agregas las imágenes definitivas. Solo asegúrate de
usar exactamente los nombres de archivo indicados arriba (o actualiza la
ruta en el componente correspondiente: `Sidebar.jsx`, `Header.jsx` y
`LoginPage.jsx`).

## Recomendaciones

- Usa formatos `.png` o `.svg` con fondo transparente para los logos.
- Tamaño recomendado para logos del sidebar/header: 64x64 px o mayor (cuadrado).
- Tamaño recomendado para la imagen de fondo del login: 1600x1200 px o mayor.
