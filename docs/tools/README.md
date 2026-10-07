# Mis herramientas

Rediseño de `/tools/`, con CasioVideo destacado. Se conserva la página principal del portfolio y el resto de sus rutas.

El título final es **Mis herramientas**. La descripción es **Aplicaciones y proyectos de inteligencia artificial, hardware y desarrollo web.** Sustituyen al texto más informal del concepto a petición del propietario.

## Diseño y verificación

Referencia inicial: [concept.png](concept.png). Capturas reales: [escritorio](desktop.png) y [móvil](mobile.png).

La referencia y la ilustración de la calculadora se generaron con ImageGen. El brief pidió un directorio editorial oscuro, tipografía sans serif, filas de proyectos separadas por líneas finas, CasioVideo destacado, calculadora a la derecha y una única llamada a la acción coral. La ilustración final se obtuvo editando el recorte de esa referencia sobre fondo `#101112`; no es una foto ni una representación técnica fiel del teclado de la CG50.

| Comprobación visual | Implementación |
|---|---|
| Estructura | Marca y enlaces discretos arriba; hero a dos columnas; listado numerado debajo. |
| Jerarquía | Titular profesional y descripción secundaria; CasioVideo es el proyecto destacado, no otra página de cuadrículas genéricas. |
| Colores | Fondo oscuro, texto blanco/gris y acento coral para la acción principal y filtro activo. |
| Ilustración | A la derecha en escritorio y debajo del CTA en móvil; no es una foto del dispositivo de pruebas. |
| Directorio | Nombre, descripción y destino Web/GitHub en filas; filtros Todo/IA/Hardware/Web. |
| Móvil | Revisión a 390 × 844 sin desbordamiento horizontal; filas a dos líneas, descripción debajo y hero apilado. |

El filtro Hardware muestra cinco proyectos y oculta los demás; Todo restaura los nueve. CasioVideo permanece destacado. Los enlaces de sitios disponibles llevan a sus webs; los demás, a GitHub. WowMessenger devolvió HTTP 500 durante la revisión, y `lagent.samilososami.com` sirve un instalador shell, por lo que sus enlaces apuntan al repositorio.

## CasioVideo en el mismo dominio

La aplicación mantiene su código fuente en [samilososami/CasioVideo](https://github.com/samilososami/CasioVideo). Aquí se publica un snapshot compilado en `public/tools/casio/casiovideo/` y una copia de su función de releases en `api/casiovideo-release.mjs`.

```sh
node scripts/sync-casiovideo.mjs ../CasioVideo
npm run build
```

El script compila el repositorio local indicado, copia únicamente los artefactos de esa aplicación y registra el commit y sus checksums en `public/tools/casio/casiovideo/source.json`. Sus dependencias se instalan con `npm ci --prefix ../CasioVideo/web` antes de sincronizar. Puede ejecutarse como usuario normal o root con acceso a ambos repositorios.

Esta integración evita enlazar al alias de Vercel protegido del proyecto independiente y no desactiva Deployment Protection. La ruta `/tools/casio/casiovideo/api/release` resuelve a la función local del portfolio. El proxy existente de Ollama se conserva. Los vídeos siguen procesándose en el navegador; no pasan por Vercel.

Para actualizar CasioVideo, sincronizar un commit limpio de su repo y desplegar el portfolio. Su app y `.g3a` no se actualizan silenciosamente en ninguna calculadora: la instalación requiere la acción del usuario.
