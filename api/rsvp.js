import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

// Добавляем проверку переменных окружения
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? 'Set' : 'Not set');
console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL ? 'Set' : 'Not set');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'ukukovskaya@gmail.com',
    pass: process.env.GMAIL_PASS || 'ulyana30kukovskaya'
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
    console.log('Received request body:', req.body);
    
    // Отправляем данные в Google Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbykM71CnXcpxnlp8rB70B9v1vkE_dwfRSM7f2Y8ug_5acvqCm5he-i4khASBcR7WLorhQ/exec?action=submitRSVP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    
    console.log('Google Script response status:', response.status);
    const data = await response.json();
    console.log('Google Script response data:', data);

    // Если Google Script успешно обработал запрос, отправляем email
    if (response.ok) {
      console.log('Attempting to send email notification...');
      await sendEmailNotification(req.body);
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Error in handler:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}

async function sendEmailNotification(rsvpData) {
  // Проверяем, что переменные окружения установлены
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !process.env.NOTIFICATION_EMAIL) {
    console.error('Missing environment variables for email');
    return;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER || 'ukukovskaya@gmail.com',
    to: process.env.NOTIFICATION_EMAIL || 'kukovskaya04@gmail.com',
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

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // НЕ выбрасываем ошибку, чтобы не ломать основной функционал
  }
}