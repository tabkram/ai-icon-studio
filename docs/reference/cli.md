# CLI

```text
ai-icon-studio new <name>      # scaffold your own icon project (icons/, skill, scripts)
ai-icon-studio init [dir]
ai-icon-studio build [options]
```

| option | default | meaning |
| --- | --- | --- |
| `--icons <dir>` | `./icons` | folder of `*.json` / `*.mjs` icons |
| `--out <dir>` | `./dist` | output folder |
| `--anims <list>` | all | `reveal,pop,pulse,spin,bounce,float,shake,wobble,fade`, or `none` |
| `--only <regex>` | all | only the icons whose name matches |
| `--font` | off | also build the icon font |

Environment: `ICONS_PYTHON` (Python with fonttools), `CHROME` and `ICONS_DIST` (for `check-font.py`).
