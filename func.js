const photoPaths = [
   'photo/cute1.jpg',
   'photo/cute2.jpg',
   'photo/cute3.jpg',
   'photo/cute4.jpg',
   'photo/cute5.jpg',
   'photo/cute6.jpg',
   'photo/cute7.jpg',
   'photo/cute8.jpg',
   'photo/cute9.jpg',
   'photo/cute10.jpg',
   'photo/cute11.jpg',
   'photo/cute12.jpg',
   'photo/cute13.jpg',
   'photo/cute14.jpg',
   'photo/cute15.jpg',
   'photo/cute16.jpg'
];
const musicLinks = [
   'https://music.youtube.com/watch?v=IE1VwGKJgm8&si=TlOsmEe_lUlvvjCO',
   'https://music.youtube.com/watch?v=GhJ043zp8hI&si=-OhbEQM3CQHg57St',
   'https://music.youtube.com/watch?v=suW8UduCg-Q&si=8k_XNOX49tAYFtt1',
   `https://music.youtube.com/watch?v=v_MZfpnCAYo&si=cNSGgQlUHyA_8CmK`,
   `https://music.youtube.com/watch?v=0MKMmCgF080&si=aHilHjlDbhZxV4Ga`,
   `https://music.youtube.com/watch?v=GHzSGpWKmA0&si=H2CZV1n8lp2eYCQw`,
   `https://music.youtube.com/watch?v=XDjB9E3YtUE&si=JjV_0eSWKLXVQfP_`,
   `https://music.youtube.com/watch?v=vz9ztA6XMC0&si=cSpM3Umj8fTmG5lW`,
   `https://music.youtube.com/watch?v=xbDhbxMVMwI&si=Kz6FC7f9OvzY-KIs`,
   `https://music.youtube.com/watch?v=i6HR3mkN17w&si=3QZ1LDGLkPgHgO9P`,
   `https://music.youtube.com/watch?v=dra9BCISlyQ&si=s2ZwamhjBg3UykSU`,
   `https://music.youtube.com/watch?v=0tTn95TLIaw&si=dewcQ2wg5L4VWocr`,
   `https://music.youtube.com/watch?v=XVhqcmyne2A&si=SlS--moM7f0GkyDU`
];

const motivationTexts = [
   "Каждый день — это новая возможность стать лучше, чем вчера.",
   "Твой потенциал безграничен, верь в себя и действуй.",
   "Даже маленький шаг вперед — это уже прогресс.",
   "Не бойся ошибок, они — ступеньки к успеху.",
   "Дисциплина — это мост между целями и их достижением.",
   "Окружи себя теми, кто вдохновляет и поддерживает тебя.",
   "Твой путь уникален, иди своим темпом, но не останавливайся.",
   "Сегодняшние усилия — это инвестиции в твое успешное будущее.",
   "Ты сильнее, чем думаешь, преодолей свои страхи.",
   "Сосредоточься на том, что можешь контролировать, и отпусти остальное.",
   "Успех приходит к тем, кто готов работать над собой.",
   "Встань, стряхни пыль и продолжай двигаться к своей мечте."
];
//@param {Object} ctx;

const axios = require('axios'); // Додаємо імпорт axios

// --- Нова допоміжна функція для екранування символів MarkdownV2 ---
function escapeMarkdownV2(text) {
   // УВАГА: Важливо, щоб цей список був повним і включав всі спецсимволи MarkdownV2
   const specialChars = [
      '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
   ];
   let escapedText = text;
   // Екрануємо кожен спецсимвол
   for (const char of specialChars) {
      // Для регулярних виразів деякі символи теж є спецсимволами, тому їх теж треба екранувати
      // Наприклад, '(' у RegExp означає початок групи, тому для пошуку '(' треба шукати '\('
      escapedText = escapedText.replace(new RegExp('\\' + char, 'g'), '\\' + char);
   }
   return escapedText;
}
// --- Кінець допоміжної функції ---

// --- Початок нового функціоналу погоди ---
async function sendWeather(ctx, city) {
   const apiKey = process.env.OPENWEATHER_API_KEY;
   const lang = 'ua'; // Мова відповіді (українська)
   const units = 'metric'; // Одиниці виміру (метричні: Цельсій)

   if (!city) {
      ctx.reply('Будь ласка, введіть назву міста.');
      return;
   }
   if (!apiKey) {
      console.error('API ключ OpenWeatherMap не знайдено в змінних оточення!');
      ctx.reply('На жаль, не вдалося отримати прогноз погоди. Будь ласка, спробуйте пізніше.');
      return;
   }

   try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=${lang}`);

      const data = response.data;
      const weatherDescription = data.weather[0].description;
      const temperature = data.main.temp;
      const feelsLike = data.main.feels_like;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;

      let message = `*Погода у місті ${escapeMarkdownV2(data.name)}:*\n`;
      message += `_Опис:_ ${escapeMarkdownV2(weatherDescription)}\n`;
      // Важливо: перетворюємо числа на рядки перед екрануванням
      message += `_Температура:_ ${escapeMarkdownV2(temperature.toString())}°C (відчувається як ${escapeMarkdownV2(feelsLike.toString())}°C)\n`;
      message += `_Вологість:_ ${escapeMarkdownV2(humidity.toString())}%\n`;
      message += `_Швидкість вітру:_ ${escapeMarkdownV2(windSpeed.toString())} м\\/с`; // Спеціально екрануємо /

      ctx.replyWithMarkdownV2(message); // Відправляємо повідомлення з форматуванням MarkdownV2
   } catch (error) {
      console.error('Помилка при отриманні погоди:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 404) {
         ctx.reply(`На жаль, місто "${city}" не знайдено. Перевірте назву.`);
      } else {
         ctx.reply('На жаль, не вдалося отримати прогноз погоди. Спробуйте пізніше.');
      }
   }
}

function sendRandomPhoto(ctx) {
   const randomIndex = Math.floor(Math.random() * photoPaths.length);
   const randomPhotoPath = photoPaths[randomIndex];

   ctx.replyWithPhoto(
      { source: randomPhotoPath },
      { caption: 'Here`s' }
   )
      .catch(err => {
         console.error(`Помилка при відправці фото '${randomPhotoPath}':`, err);
         ctx.reply('На жаль, не вдалося відправити фото. Спробуйте пізніше.');
      });
}

function sendRandomMusicLink(ctx) {
   const randomIndex = Math.floor(Math.random() * musicLinks.length);
   const randomMusicLink = musicLinks[randomIndex];

   const inlineKeyboard = {
      reply_markup: {
         inline_keyboard: [
            [
               {
                  text: 'Слухати на YouTube Music', // Текст на кнопці
                  url: randomMusicLink // Посилання, яке відкриється при натисканні
               }
            ],
            [
               {
                  text: 'Відкрити Google', // Інший текст для другої кнопки
                  url: 'https://www.google.com' // Інше посилання
               }
            ]
         ]
      }
   };

   ctx.reply(`Here is cool song for you:`, inlineKeyboard)
      .catch(err => {
         console.error(`Помилка при відправці посилання на музику:`, err);
         ctx.reply('На жаль, не вдалося відправити музику. Спробуйте пізніше.');
      });
}

function sendRandomMotivation(ctx) {
   const randomIndex = Math.floor(Math.random() * motivationTexts.length);
   const randomMotivation = motivationTexts[randomIndex];

   ctx.reply(`${randomMotivation}`)
      .catch(err => {
         console.error(`Помилка при відправці мотивації:`, err);
         ctx.reply('На жаль, не вдалося відправити текст. Спробуйте пізніше.');
      })
}

module.exports = {
   sendRandomPhoto,
   sendRandomMusicLink,
   sendRandomMotivation,
   sendWeather
};

