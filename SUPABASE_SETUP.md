# Настройка Supabase для TrackMyLife

## 1. Создание проекта в Supabase

1. Зайдите на [supabase.com](https://supabase.com) и создайте аккаунт
2. Создайте новый проект (New Project)
3. Запомните пароль от базы данных

## 2. Настройка базы данных

1. Перейдите в **SQL Editor** в панели Supabase
2. Откройте файл `supabase/schema.sql` из этого репозитория
3. Скопируйте содержимое и выполните его в SQL Editor
4. Это создаст таблицы `trackers` и `entries` с RLS-политиками

## 3. Настройка переменных окружения

1. В панели Supabase перейдите в **Settings → API**
2. Скопируйте **Project URL** и **anon/public key**
3. Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Настройка аутентификации

1. В панели Supabase перейдите в **Authentication → Providers**
2. Убедитесь, что **Email** провайдер включён
3. (Опционально) Отключите **Confirm email** в **Authentication → Settings** для упрощения тестирования

## 5. Запуск приложения

```bash
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## Структура базы данных

### Таблица `trackers`
| Поле | Тип | Описание |
|------|------|----------|
| id | uuid | Первичный ключ |
| user_id | uuid | Ссылка на auth.users |
| name | text | Название трекера |
| type | text | 'boolean' или 'quantitative' |
| unit | text | Единица измерения (опц.) |
| color | text | HEX цвет |
| created_at | timestamptz | Дата создания |
| updated_at | timestamptz | Дата обновления |

### Таблица `entries`
| Поле | Тип | Описание |
|------|------|----------|
| id | uuid | Первичный ключ |
| user_id | uuid | Ссылка на auth.users |
| tracker_id | uuid | Ссылка на trackers |
| date | date | Дата записи |
| value_boolean | boolean | Для boolean трекеров |
| value_number | double | Для quantitative трекеров |
| created_at | timestamptz | Дата создания |
| updated_at | timestamptz | Дата обновления |

### Row Level Security
Все таблицы защищены RLS-политиками. Каждый пользователь может видеть и изменять только свои данные.
