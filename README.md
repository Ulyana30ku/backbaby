# BabyProxy

Минимальный backend-прокси для пересылки RSVP-запросов на Google Apps Script.

## Как развернуть на Vercel

1. [Зарегистрируйтесь на Vercel](https://vercel.com/signup) (если еще не зарегистрированы).
2. Склонируйте этот репозиторий или создайте новый проект с этими файлами.
3. Зайдите в Vercel, выберите "Add New Project" и импортируйте этот проект с GitHub/или загрузите вручную.
4. Деплой произойдет автоматически.

## Пример запроса с фронтенда

```js
fetch('https://<your-vercel-domain>/api/rsvp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Иван', attending: true })
})
  .then(res => res.json())
  .then(console.log);
```
```

---

## 3. Деплой

1. **Залейте эти файлы в новый репозиторий на GitHub.**
2. **Зайдите на [vercel.com](https://vercel.com), выберите "Add New Project", импортируйте ваш репозиторий.**
3. **Vercel сам всё соберёт и задеплоит.**
4. **Ваш endpoint будет доступен по адресу:**  
   `https://<your-vercel-project>.vercel.app/api/rsvp`

---

Если хотите, я могу сгенерировать все эти файлы прямо сейчас в вашем проекте. Подтвердите, и я создам их!