# NO GNOMO — Weekly Dropper

Versión sencilla de la ruleta semanal de *WoW Forever*, preparada para GitHub Pages.

## Contenido

- 153 nombres extraídos del JSON original, incluida la entrada `.`.
- `players.json` solo contiene nombres: no incluye IDs de Discord ni otros metadatos.
- Ruleta con giro rápido, frenado progresivo, amago final y confeti.
- Logo original de NO GNOMO.
- No contiene música ni archivos de audio.

## Publicarlo gratis en GitHub Pages

1. Crea un repositorio público llamado, por ejemplo, `no-gnomo`.
2. Sube todo el contenido de este ZIP a la raíz del repositorio.
3. En GitHub, entra en **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona `main`, la carpeta `/ (root)` y pulsa **Save**.

La dirección quedará así:

`https://TU-USUARIO.github.io/no-gnomo/`

## Probarlo en local

Como la web lee `players.json`, ábrela mediante un pequeño servidor:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`.
