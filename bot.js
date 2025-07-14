require('dotenv').config();

const { Telegraf } = require('telegraf');
const { sendRandomPhoto, sendRandomMusicLink, sendRandomMotivation } = require('./func');

const bot = new Telegraf(process.env.BOT_TOKEN);

const userStates = {};
// Обробник команди /start
bot.start((ctx) => {
   // ctx (context) - це об'єкт, який містить інформацію про поточне повідомлення,
   // користувача, чат тощо.
   // ctx.reply() - функція для надсилання відповіді в чат
   ctx.reply('What do you want?');
});

//Обробник для кнопки "Відправити фото"
bot.hears('Cute photo', (ctx) => {
   sendRandomPhoto(ctx);
});

// Обробник для кнопки "Відправити пісню з YouTube Music"
bot.hears('Cool music', (ctx) => {
   sendRandomMusicLink(ctx);
});

// Обробник для кнопки "Написати мотиваційне повідомлення"
bot.hears('Motivation', (ctx) => {
   sendRandomMotivation(ctx);
});

bot.hears('Weather', (ctx) => {
   userStates[ctx.from.id] = 'waiting_for_city'; // Встановлюємо стан: чекаємо назву міста
   ctx.reply('Будь ласка, введіть назву міста:');
});
// Обробник для БУДЬ-ЯКОГО текстового повідомлення від користувача
// Ця функція спрацьовує, коли користувач надсилає будь-який текст (крім команд, що починаються з '/')
// Змінюємо обробник для БУДЬ-ЯКОГО текстового повідомлення
bot.on('text', async (ctx) => { // Зробили функцію async, щоб можна було використовувати await
   const userId = ctx.from.id;
   const userMessage = ctx.message.text;

   if (userStates[userId] === 'waiting_for_city') {
      // Якщо бот чекає місто від цього користувача
      userStates[userId] = null; // Скидаємо стан
      await sendWeather(ctx, userMessage); // Викликаємо функцію погоди з назвою міста
   } else {
      // Якщо бот не чекає місто, показуємо звичайну клавіатуру
      const keyboard = {
         reply_markup: {
            keyboard: [
               [{ text: 'Cute photo' }],
               [{ text: 'Cool music' }],
               [{ text: 'Motivation' }],
               [{ text: 'Weather' }] // Додаємо нову кнопку
            ],
            resize_keyboard: true,
            one_time_keyboard: false
         }
      };
      ctx.reply('Choose what do u want to get:', keyboard);
   }
});
// Запускаємо бота
// Ця функція вмикає бота і змушує його слухати вхідні повідомлення
// --- ДОДАЙТЕ ЦЕЙ БЛОК КОДУ ---
// Імпортуємо модуль http для створення простого веб-сервера
const http = require('http');

// Визначаємо порт, на якому буде слухати веб-сервер
// Render надає порт через змінну оточення PORT
// Якщо змінна PORT не встановлена (наприклад, при локальному запуску), використовуємо 3000
const port = process.env.PORT || 3000;

// Створюємо простий HTTP-сервер
const server = http.createServer((req, res) => {
   // Відповідаємо на будь-який запит
   res.statusCode = 200;
   res.setHeader('Content-Type', 'text/plain');
   res.end('Bot is running and listening for Telegram updates.\n');
});

// Запускаємо веб-сервер на вказаному порту
server.listen(port, () => {
   console.log(`Web server is listening on port ${port}`);
});
bot.launch();

// Вивід повідомлення в консоль, коли бот запущено
console.log('Бот успішно запущено!');

// Опціонально: Додаємо graceful shutdown (плавне завершення роботи бота)
// Це дозволяє боту коректно завершити роботу при зупинці скрипта (наприклад, Ctrl+C)
process.once('SIGINT', () => {
   bot.stop('SIGINT');
   server.close(() => console.log('Web server closed.')); // Закриваємо веб-сервер при зупинці
});
process.once('SIGTERM', () => {
   bot.stop('SIGTERM');
   server.close(() => console.log('Web server closed.')); // Закриваємо веб-сервер при зупинці
});