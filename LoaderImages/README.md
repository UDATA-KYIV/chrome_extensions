# Документація зі створення розширень Chrome

## Встановлення розширення

1. **Створіть папку для розширення.**
2. **Створіть `manifest.json` файл:** Цей файл визначає основні властивості вашого розширення.
3. **Додайте скрипти та ресурси:** В папку розширення додайте необхідні скрипти та файли.
4. **Перейдіть в браузері на `chrome://extensions/`.**
5. **Ввімкніть "режим розробника".**
6. **Завантажте своє розширення.**

## 1. Приклад `manifest.json`

```json
{
  "background": {
    "persistent": true, // Цей параметр визначає, що фоновий скрипт буде працювати постійно.
    "scripts": [
      "js/background.js" // Вказує шлях до файлу фонового скрипта.
    ]
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>" // Вказує, що цей контентний скрипт буде запускатися на всіх URL.
      ],
      "js": [
        "js/test.js" // Вказує шлях до файлу контентного скрипта.
      ]
    }
  ],
  "browser_action": {
    "default_icon": "./img/icons/extension/free.png", // Вказує шлях до іконки розширення.
    "default_popup": "popup.html", // Вказує шлях до файлу, який буде відображено у спливаючому вікні розширення.
    "default_title": "__MSG_name__" // Вказує заголовок для дії браузера, який використовує локалізоване значення.
  },
  "default_locale": "en", // Вказує мову за замовчуванням для локалізованих повідомлень.
  "description": "__MSG_description__", // Вказує опис розширення, який використовує локалізоване значення.
  "icons": {
    "128": "./img/icons/extension/free.png" // Вказує шлях до іконки розширення розміром 128x128.
  },
  "manifest_version": 2, // Вказує версію маніфесту.
  "name": "__MSG_name__", // Вказує ім'я розширення, яке використовує локалізоване значення.
  "options_page": "popup.html?options=1", // Вказує шлях до сторінки опцій розширення.
  "permissions": [
    "activeTab", // Дозволяє розширенню доступ до активної вкладки браузера.
    "cookies", // Дозволяє розширенню доступ до кукі.
    "clipboardWrite", // Дозволяє розширенню записувати у буфер обміну.
    "storage", // Дозволяє розширенню використовувати сховище браузера.
    "background", // Дозволяє розширенню виконувати фонові завдання.
    "<all_urls>", // Дозволяє розширенню доступ до всіх URL.
    "tabs" // Дозволяє розширенню доступ до вкладок браузера.
  ],
  "short_name": "__MSG_name__", // Вказує коротке ім'я розширення, яке використовує локалізоване значення.
  "update_url": "https://clients2.google.com/service/update2/crx", // Вказує URL для оновлення розширення.
  "version": "1.1" // Вказує версію розширення.
}
```
## 2. API 

### 2.1 chrome.tabs.query
API для відправлення повідомлення з Extensions на front:

```javascript
chrome.tabs.query(
  // 1 Параметр chrome.tabs.query: ОБ'ЄКТ ЗАПИТУ.
  // Виконує запит на отримання інформації про вкладки.
  // У даному випадку запитуються вкладки, які активні (active: true) та знаходяться в поточному вікні (currentWindow: true).
  { active: true, currentWindow: true },
  // 2 Параметр chrome.tabs.query: ФУНКЦІЯ, ЯКА ВЖЕ МАЄ В ПАРАМЕТРАХ МАСИВ ВКЛАДОК.
  // function (tabs): Це callback-функція, яка буде викликана після виконання запиту chrome.tabs.query. Вона отримує масив вкладок tabs, що відповідають умовам запиту.
  function (tabs) {
    // chrome.tabs.sendMessage: Відправляє повідомлення в зазначену вкладку.
    chrome.tabs.sendMessage(
      // 1 Параметр chrome.tabs.sendMessage: ВКЛАДКА.
      // У даному випадку відправляється повідомлення в першу (і єдину активну) вкладку з масиву tabs.
      tabs[0].id,
      // 2 Параметр chrome.tabs.sendMessage: ПОВІДОМЛЕННЯ.
      // Повідомлення містить об'єкт { word: data }, де data — це значення, яке ви хочете передати.
      { word: data },
      // 3 Параметр chrome.tabs.sendMessage: ЗВОРОТНІЙ ВИКЛИК.
      // function (response): Це callback-функція, яка буде викликана після того, як повідомлення буде відправлено і отримано відповідь від скрипта вмісту.
      function (response) {
        console.log(response);
      }
    );
  }
);
```
### 2.2 chrome.runtime.onInstalled
Слухач подій для встановлення або оновлення розширення:
```javascript
chrome.runtime.onInstalled.addListener(function (details) {
    // chrome.runtime.onInstalled:
    // Це подія виникає, коли розширення встановлено, оновлено або коли Chrome оновлено до нової версії і розширення повторно встановлено.
    if (details.reason === 'install') {
        console.log('Extension installed');
    } else if (details.reason === 'update') {
        console.log('Extension updated from version ' + details.previousVersion);
    }
    // Аргументи:
    // details (об'єкт): Об'єкт, що містить інформацію про подію встановлення.
    // reason (рядок): Причина встановлення. Можливі значення:
    // install: Розширення встановлено.
    // update: Розширення оновлено.
    // chrome_update: Chrome оновлено до нової версії.
    // shared_module_update: Оновлення загального модуля.
    // previousVersion (рядок, необов'язковий): Попередня версія розширення, якщо reason - update.
    // id (рядок, необов'язковий): Ідентифікатор розширення, якщо reason - shared_module_update.
});
```

### 2.3 chrome.tabs.onUpdated
Слухач подій для оновлення вкладки:
```javascript
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // chrome.tabs.onUpdated:
    // Це подія виникає, коли оновлюється стан або вміст вкладки.
    if (changeInfo.status === 'complete' && tab.active) {
        chrome.tabs.sendMessage(tabId, { greeting: "hello from background extension" }, function (response) {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
            } else {
                console.log(response.farewell);
            }
        });
    }
    // Аргументи:
    // tabId (число): Ідентифікатор вкладки.
    // changeInfo (об'єкт): Об'єкт, що містить зміни вкладки.
    // status (рядок, необов'язковий): Стан завантаження вкладки. Можливі значення:
    // loading: Вкладка завантажується.
    // complete: Вкладка повністю завантажена.
    // url (рядок, необов'язковий): URL вкладки, якщо змінився.
    // Інші властивості: можуть включати зміни атрибутів вкладки, таких як favIconUrl, title тощо.
    // tab (об'єкт): Об'єкт вкладки, що містить всю інформацію про вкладку.
});
```
### 2.4 chrome.runtime.onMessage
Слухач для отримання повідомлень:
```javascript
chrome.runtime.onMessage.addListener(
    // Подія chrome.runtime.onMessage.addListener
    // використовується для прослуховування повідомлень, відправлених іншим компонентом розширення (наприклад, фоновим скриптом, popup або контентним скриптом).
    // Аргументи:
    // message (об'єкт): Об'єкт повідомлення, відправленого за допомогою chrome.runtime.sendMessage або chrome.tabs.sendMessage.
    // sender (об'єкт): Об'єкт, що містить інформацію про відправника повідомлення.
    // tab (об'єкт, необов'язковий): Об'єкт вкладки, якщо повідомлення відправлено з контентного скрипта.
    // id (рядок): Ідентифікатор розширення або застосунку, що відправило повідомлення.
    // url (рядок, необов'язковий): URL фрейму, що відправив повідомлення (якщо доступно).
    // sendResponse (функція): Функція, що використовується для відправки відповіді назад відправнику повідомлення.
    function (data, sender, sendResponse) {
        console.log(data);
        if (data.greeting) {
            console.log(data.greeting);
            sendResponse({ farewell: "goodbye" });
        }
    }
);
```