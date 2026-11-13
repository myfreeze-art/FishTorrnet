# Snap Store

Описание пакета лежит в `snap/snapcraft.yaml`. Сборка проверяется автоматически в каждом pull request, который меняет эту папку, и при каждом выпуске (`v*`). Готовые `.snap` для amd64 и arm64 прикрепляются к выпуску на GitHub.

## Шаг 1. Имя в магазине

1. Откройте [snapcraft.io](https://snapcraft.io) и войдите через **Ubuntu One** (бесплатная учётная запись).
2. Нажмите на своё имя → **Register a snap name** и введите `fishtorrnet`.

## Шаг 2. Публикация, вариант без компьютера

1. На [snapcraft.io/snaps](https://snapcraft.io/snaps) откройте `fishtorrnet` → вкладка **Builds**.
2. Нажмите **Connect to GitHub**, войдите и выберите репозиторий `myfreeze-art/FishTorrnet`.
3. Snapcraft сам соберёт пакет из `snap/snapcraft.yaml` после каждого изменения в `main` и выложит его в канал **edge**.
4. Когда сборка появится, откройте вкладку **Releases** и перенесите её в канал **stable**. После этого программа ставится командой `sudo snap install fishtorrnet`.

## Шаг 2. Публикация, вариант с Linux-компьютером

Тогда выпуски на GitHub будут сразу публиковаться в **stable**.

```sh
sudo snap install snapcraft --classic
snapcraft export-login --snaps=fishtorrnet --acls package_access,package_push,package_update,package_release -
```

Скопируйте весь вывод команды в секрет репозитория: GitHub → **Settings → Secrets and variables → Actions → New repository secret**, имя `SNAPCRAFT_STORE_CREDENTIALS`.

## Шаг 3. Страница в магазине

Вкладка **Listing** на snapcraft.io:

- категории: **Utilities**, второй — **Productivity**;
- скриншоты: `docs/screenshots/main-dark.png`, `docs/screenshots/add-fishguard.png`, `docs/screenshots/main-light.png`;
- описание и ссылки уже заполнены из `snapcraft.yaml`.

## Что разрешено пакету

Пакет работает в строгой изоляции (`strict`) и запрашивает только нужное: сеть и входящие соединения для пиров и удалённого доступа, папку пользователя и внешние диски для загрузок, значок в трее. Такой пакет проходит автоматическую проверку магазина без ручного одобрения.
