require('dotenv').config();
const axios = require('axios');
const { Telegraf, Markup } = require('telegraf');
const { sendRandomPhoto, sendRandomMusicLink, sendRandomMotivation, sendWeather, escapeMarkdownV2 } = require('./func');
const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const PORT = process.env.PORT || 3000; // Порт, який буде слухати твій сервер (з Render)
const WEBHOOK_URL = process.env.WEBHOOK_URL; // URL нашого сервісу Render, куди Telegram буде надсилати оновлення

const bot = new Telegraf(BOT_TOKEN);

// Об'єкт для зберігання стану користувача (чи чекаємо на місто)
const userStates = {};

// Переконаємося, що змінні оточення встановлені
if (!BOT_TOKEN) {
   console.error('BOT_TOKEN не знайдено в змінних оточення! Переконайтеся, що він встановлений.');
   process.exit(1); // Завершуємо процес, якщо токена немає
}
if (!WEBHOOK_URL) {
   console.error('WEBHOOK_URL не знайдено в змінних оточення! Переконайтеся, що він встановлений на Render.');
   // Запускаємо в режимі Polling як запасний варіант для локальної розробки,
   // або якщо WEBHOOK_URL не встановлено на Render, що вказує на проблему.
   // Але на Render в бойових умовах це повинно бути!
   console.log('Запускаємо бота в режимі Long Polling (для локального тестування або якщо WEBHOOK_URL відсутній).');
   bot.launch();
} else {
   // Якщо WEBHOOK_URL встановлено (для розгортання на Render)
   console.log(`Налаштовуємо Webhook на ${WEBHOOK_URL}`);
   bot.telegram.setWebhook(WEBHOOK_URL + `/bot${BOT_TOKEN}`) // Вказуємо Telegram, куди надсилати оновлення. Додаємо унікальний шлях.
      .then(() => {
         console.log(`Webhook встановлено успішно на ${WEBHOOK_URL}/bot${BOT_TOKEN}`);
         // Запускаємо HTTP-сервер для прийому вебхуків
         bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT); // Тепер бот слухає на вказаному порту та шляху
         console.log(`Бот слухає вхідні вебхуки на порту ${PORT}`);
      })
      .catch(err => {
         console.error('Помилка встановлення вебхука або запуску сервера:', err);
         // Важливо: якщо вебхук не встановлюється, бот не працюватиме належним чином.
         // Можливо, тут варто додати fallback на bot.launch() або просто завершити програму.
         // Для Render Web Service, ця помилка призведе до скасування деплою, що є очікувано.
      });
}

// Додамо обробник помилок, щоб бачити їх у логах Render
bot.catch((err, ctx) => {
   console.error(`Ooops, encountered an error for ${ctx.update?.update_id}:`, err);
   // ctx.reply('Виникла внутрішня помилка. Будь ласка, спробуйте пізніше.'); // Можна додати для користувача
});
// Обробник команди /start
bot.start((ctx) => ctx.reply('What do you want?'));
// ctx (context) - це об'єкт, який містить інформацію про поточне повідомлення,
// користувача, чат тощо.
// ctx.reply() - функція для надсилання відповіді в чат


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


// bot.launch() - ЦЕЙ РЯДОК МИ ВИДАЛИЛИ, Оскільки тепер використовуємо вебхуки
// console.log('Бот успішно запущено!'); // Цей лог тепер виводиться після запуску вебхука

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