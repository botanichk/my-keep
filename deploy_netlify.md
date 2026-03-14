# 🚀 Деплой на Netlify через терминал

> Без GitHub, без браузера — всё через терминал VS Code

---

## Шаг 1 — Открой терминал в VS Code

`Ctrl+`` ` (backtick — кнопка слева от цифры 1)

Убедись что ты в папке проекта — в терминале должно быть `my-keep`

---

## Шаг 2 — Собери проект

```bash
npm run build
```

Появится папка `dist` — это и есть готовое приложение.

---

## Шаг 3 — Установи Netlify CLI

```bash
npm install -g netlify-cli
```

---

## Шаг 4 — Войди в Netlify

```bash
netlify login
```

Откроется браузер → нажми **Authorize** → вернись в терминал.

---

## Шаг 5 — Задеплой

```bash
netlify deploy --prod --dir=dist
```

Терминал спросит:
- **Create & configure a new site** → выбери это (стрелками + Enter)
- **Team** → выбери свою команду → Enter
- **Site name** → напечатай `my-keep` или оставь пустым → Enter

Через 30 секунд в терминале появится ссылка:

```
Website URL: https://my-keep.netlify.app
```

Открывай на любом устройстве 🎉
