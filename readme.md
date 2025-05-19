# Foobar

Effective-mobile приложение

## Installation

Используйте пакетный менеджер npm

```bash
npm install
```

## Первый запуск 

```
# Doker контейнера с postgres
docker-compose up -d --build

# Запуск миграции в базу
npm run pmdev

# Обновление клиента prisma
npm run pgc 

# Запуск app index.ts
npm run dev
## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)