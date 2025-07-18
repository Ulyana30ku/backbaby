import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Отправляем данные в Google Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbykM71CnXcpxnlp8rB70B9v1vkE_dwfRSM7f2Y8ug_5acvqCm5he-i4khASBcR7WLorhQ/exec?action=submitRSVP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();

    // Пытаемся отправить email, но не ломаем основной функционал, если ошибка
    if (response.ok) {
      sendEmailNotification(req.body).catch((e) => {
        console.error('Email send error:', e);
      });
    }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}

async function sendEmailNotification(rsvpData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !process.env.NOTIFICATION_EMAIL) {
    console.error('Email env variables not set');
    return;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL,
    subject: 'Новое RSVP подтверждение',
    html: `
      <h2>Новое подтверждение участия</h2>
      <p><strong>Имя:</strong> ${rsvpData.name}</p>
      <p><strong>Email:</strong> ${rsvpData.email || 'Не указан'}</p>
      <p><strong>Телефон:</strong> ${rsvpData.phone || 'Не указан'}</p>
      <p><strong>Присутствие:</strong> ${rsvpData.attending ? 'Да' : 'Нет'}</p>
      <p><strong>Количество гостей:</strong> ${rsvpData.guests || 1}</p>
      <p><strong>Сообщение:</strong> ${rsvpData.message || 'Не указано'}</p>
      <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}