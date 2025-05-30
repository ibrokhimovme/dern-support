// ownership.js
const allowedOrigins = [
  'http://localhost:3000', // Локальный клиент
  'https://digus.uz', // Основной сайт
  'https://www.digus.uz', // Альтернативный домен
];

function ownershipMiddleware(req, res, next) {
  const origin = req.get('Origin') || req.get('Referer') || '';

  // Проверка, начинается ли Origin/Referer с разрешенных сайтов
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));

  if (isAllowed) {
    // Всё хорошо — пускаем дальше
    return next();
  }

  // Если источник неизвестен — делаем вид, что ничего не произошло
  // Например, просто игнорируем тело запроса
  res.status(204).end(); // 204 No Content — тихий ответ, без нагрузки
}

export default ownershipMiddleware;
