# Публикация в Microsoft Store

Всё бесплатно. Магазин сам подписывает пакет, поэтому у пользователей не будет предупреждения SmartScreen.

## Что лежит в этой папке

| Файл | Зачем |
| --- | --- |
| `listing/<язык>.md` | Готовые тексты страницы в магазине на 10 языках: название, описание, что нового, краткое описание, особенности, поисковые слова |
| `images/logo-300.png` | Значок 1:1, 300×300 |
| `images/logo-1080.png`, `images/logo-2160.png` | Обложка 1:1 для страницы магазина |
| Скриншоты | Берутся из `docs/screenshots` (английские) и `docs/screenshots/ru` (русские), 1600×1000 |

Политика конфиденциальности: `https://github.com/myfreeze-art/FishTorrnet/blob/main/docs/PRIVACY.md`

## Шаг 1. Регистрация

1. Откройте [Partner Center](https://partner.microsoft.com/dashboard/registration) и войдите учётной записью Microsoft.
2. Выберите **Individual** (частный разработчик), страну и отображаемое имя издателя, например `FishTorrnet`. Это имя увидят пользователи.
3. Пройдите проверку личности, если её попросят.

## Шаг 2. Зарезервировать имя

1. **Apps and games → New product → MSIX or PWA app**.
2. Введите `FishTorrnet` и нажмите **Check availability**, затем **Reserve product name**. Если имя занято, возьмите `FishTorrnet Torrent Client`.

## Шаг 3. Передать данные пакета на GitHub

1. В приложении откройте **Product management → Product identity**.
2. Скопируйте три значения в репозиторий: GitHub → **Settings → Secrets and variables → Actions → вкладка Variables → New repository variable**.

| Переменная на GitHub | Строка в Partner Center |
| --- | --- |
| `MSIX_IDENTITY_NAME` | Package/Identity/Name |
| `MSIX_PUBLISHER` | Package/Identity/Publisher (начинается с `CN=`) |
| `MSIX_PUBLISHER_DISPLAY_NAME` | Package/Properties/PublisherDisplayName |

3. Выпустите новую версию, например `v0.2.1`. В выпуске появится файл `FishTorrnet_0.2.1_x64.msix` с вашими данными.

## Шаг 4. Заполнить заявку

Нажмите **Start submission** и пройдите разделы.

**Pricing and availability.** Цена: **Free**. Рынки: все.

**Properties.**
- Category: **Utilities & tools**.
- Privacy policy URL: ссылка выше.
- Website: `https://github.com/myfreeze-art/FishTorrnet`
- Support contact info: `https://github.com/myfreeze-art/FishTorrnet/issues`

**Age ratings.** Пройдите анкету IARC, отвечайте честно. Программа не содержит насилия, покупок и общения между пользователями. Она скачивает файлы, которые выбирает сам пользователь.

**Packages.** Загрузите `FishTorrnet_X.Y.Z_x64.msix` из выпуска на GitHub. Устройства: только **Desktop**.

**Store listings.** Нажмите **Add/remove languages** и включите: English (United States), Русский, Українська, Deutsch, Français, Español (España), Português (Brasil), 中文(中华人民共和国), 日本語, Türkçe. Для каждого языка откройте файл из `listing/` и скопируйте поля. Загрузите скриншоты и логотипы. Минимум для первой отправки — английский и русский, остальные языки можно добавить в следующей заявке.

**Submission options → Notes for certification.** Вставьте этот текст:

```
FishTorrnet is an open source desktop BitTorrent client (Tauri, Win32) packaged as MSIX.

runFullTrust is required because this is a classic desktop app. It runs a local BitTorrent engine, opens network ports for peers and uses the Windows file system to save downloads chosen by the user.

How to test:
1. Start FishTorrnet and click Add.
2. Paste a legal torrent, for example the Debian installer from https://cdimage.debian.org/debian-cd/current/amd64/bt-cd/ (copy the link of the .torrent file).
3. Click Next, then Add. The download starts and its progress is shown in the list.

The app does not include any search for copyrighted content, ads or telemetry. Source code: https://github.com/myfreeze-art/FishTorrnet
```

Если спросят про **Restricted capabilities**, вставьте второй абзац этого текста.

## Шаг 5. Отправить

Нажмите **Submit to the Store**. Microsoft проверит пакет и страницу. Если что-то не так, придёт письмо с причиной. Пришлите её, разберёмся.

## Следующие версии

После каждого нового выпуска на GitHub: Partner Center → **Update** → **Packages**, загрузите новый `.msix` и обновите поле «What's new» во всех языках.
