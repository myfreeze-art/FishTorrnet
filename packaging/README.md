# Распространение FishTorrnet

Всё, что здесь описано, бесплатно. Платные сертификаты не нужны.

## Как выпустить новую версию

Номер версии в файлах менять не нужно: сборка берёт его из тега. Тег должен выглядеть как `v0.2.0`, номер должен быть больше предыдущего.

**Через сайт GitHub.** Откройте Releases → **Draft a new release** → **Choose a tag**, введите `v0.2.0` и выберите **Create new tag: v0.2.0 on publish**. Ветка `main`. Нажмите **Publish release**. Файлы появятся в этом выпуске, когда закончится сборка: за ней можно следить на вкладке Actions. Если поле описания оставить пустым, сборка подставит текст из `docs/releases/vX.Y.Z.md`, а если такого файла нет, общий текст из `packaging/release-notes.md`. Для новой версии скопируйте `docs/releases/v0.2.0.md`, переименуйте и обновите раздел «Что нового» во всех языках.

**Через терминал:**

```sh
git checkout main
git pull
git tag v0.2.0
git push origin v0.2.0
```

В этом случае выпуск создаётся черновиком. Когда сборка закончится, откройте его на странице Releases и нажмите **Publish release**.

Дальше работают две автосборки.

**Release** берёт выпуск с этим тегом (или создаёт черновик, если его нет) и кладёт в него:

- установщики для Windows (`.exe`, `.msi`), macOS (`.dmg`, одна сборка для Intel и Apple Silicon) и Linux (`.deb`, `.rpm`, `.AppImage`);
- пакет `.msix` для Microsoft Store;
- сервер без окна для Linux x86_64 и arm64, Windows и macOS;
- `SHA256SUMS.txt` с контрольными суммами всех файлов;
- `fishtorrnet-vX.Y.Z-store-manifests.zip` с готовыми описаниями для winget, AUR и Flathub, в которых уже стоят ссылки и контрольные суммы этой версии.

**Docker** публикует образ `ghcr.io/myfreeze-art/fishtorrnet` для amd64 и arm64 с тегами версии и `latest`.

После первой публикации откройте страницу пакета в разделе Packages профиля и сделайте его публичным, иначе Docker-образ не скачать без входа.

## macOS без сертификата

Приложение подписывается без сертификата (ad-hoc, `signingIdentity: "-"`). Этого достаточно, чтобы оно запускалось на Mac с процессорами Apple. При первом запуске macOS предупредит, что разработчик не проверен. Пользователь открывает «Системные настройки → Конфиденциальность и безопасность» и нажимает «Всё равно открыть». Эта инструкция уже есть в описании выпуска.

## Microsoft Store

Магазин сам подписывает пакеты `.msix`, поэтому SmartScreen не показывает предупреждений.

1. Зарегистрируйтесь в [Partner Center](https://partner.microsoft.com/dashboard/registration) как частный разработчик.
2. Создайте приложение и зарезервируйте имя FishTorrnet.
3. В разделе «Product identity» найдите три значения и добавьте их в репозиторий на GitHub: Settings → Secrets and variables → Actions → вкладка Variables:
   - `MSIX_IDENTITY_NAME` — значение `Package/Identity/Name`;
   - `MSIX_PUBLISHER` — значение `Package/Identity/Publisher`, начинается с `CN=`;
   - `MSIX_PUBLISHER_DISPLAY_NAME` — значение `Package/Properties/PublisherDisplayName`.
4. Выпустите версию. Загрузите файл `FishTorrnet_X.Y.Z_x64.msix` из выпуска в Partner Center в разделе «Packages».
5. В анкете укажите, что приложению нужна возможность `runFullTrust`: это обычное настольное приложение. В описании для проверки напишите, что это BitTorrent-клиент без встроенного поиска контента.

Для работы нужен WebView2. В Windows 11 он есть всегда, в Windows 10 обычно ставится вместе с Edge.

## winget

После публикации выпуска:

1. Скачайте из выпуска `fishtorrnet-vX.Y.Z-store-manifests.zip` и распакуйте.
2. Сделайте форк [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs).
3. Скопируйте папку `winget/manifests/m/myfreeze-art/FishTorrnet/X.Y.Z` в такой же путь своего форка.
4. Откройте pull request в `microsoft/winget-pkgs`. Автоматическая проверка скачает установщик и сверит контрольную сумму, затем пакет посмотрит модератор.

После принятия программа ставится командой `winget install myfreeze-art.FishTorrnet`. Для следующих версий повторите шаги 1–4 с новой папкой.

## AUR (Arch Linux)

1. Зарегистрируйтесь на [aur.archlinux.org](https://aur.archlinux.org) и добавьте в профиль SSH-ключ.
2. Склонируйте пустой пакет: `git clone ssh://aur@aur.archlinux.org/fishtorrnet-bin.git`.
3. Скопируйте в него `aur/PKGBUILD` и `aur/.SRCINFO` из архива с описаниями.
4. Выполните `git add PKGBUILD .SRCINFO && git commit -m "Update to X.Y.Z" && git push`.

Пакет появится сразу, модерации нет.

## Flathub

1. Сделайте форк [flathub/flathub](https://github.com/flathub/flathub) и создайте ветку от `new-pr`.
2. Положите в корень файлы из папки `flatpak` архива с описаниями.
3. Откройте pull request в ветку `new-pr` с названием `Add io.github.myfreeze_art.FishTorrnet`.

Идентификатор `io.github.myfreeze_art` Flathub подтверждает через ваш аккаунт GitHub. Описание собирает приложение из готового `.deb`. Если модераторы попросят собирать из исходного кода, это отдельная задача: нужно подготовить офлайн-зависимости Rust и npm.

Перед каждым выпуском добавляйте новую версию в раздел `<releases>` файла `flatpak/io.github.myfreeze_art.FishTorrnet.metainfo.xml`.

## Docker

```sh
docker run -d --name fishtorrnet \
  -p 8787:8787 -p 51420:51420 -p 51420:51420/udp \
  -v ./config:/config -v ./downloads:/downloads \
  ghcr.io/myfreeze-art/fishtorrnet:latest
docker logs fishtorrnet
```

В журнале будет ссылка с ключом доступа. Замените в ней `127.0.0.1` на адрес сервера. Пример для docker compose лежит в `docker-compose.yml` в корне репозитория. Контейнер работает от пользователя с UID 1000, у папок `config` и `downloads` должен быть такой владелец.

## Бесплатная подпись для Windows

[SignPath Foundation](https://signpath.org) бесплатно подписывает программы с открытым кодом. Тогда и `.exe` с сайта будет без предупреждений SmartScreen. Заявку подаёт владелец проекта. Обычно просят открытую лицензию, сборку в CI (обе уже есть) и немного истории проекта: выпуски, звёзды, пользователей. Подавайте после первых выпусков.

## Если антивирус ругается

Торрент-клиенты иногда получают ложные срабатывания. Отправьте файл на проверку в [Microsoft Security Intelligence](https://www.microsoft.com/en-us/wdsi/filesubmission), выбрав «Software developer». Это бесплатно.
