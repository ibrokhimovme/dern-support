# Kompyuter Ta'mirlash Backend API

Bu loyiha kompyuter ta'mirlash kompaniyasi uchun backend API hisoblanadi.

## Xususiyatlar

- Jismoniy va yuridik shaxslar uchun ro'yxatdan o'tish
- JWT autentifikatsiya
- 3 xil rol: user, master, manager
- MongoDB database
- Parol hashlash

## O'rnatish

1. MongoDB ni local kompyuteringizda ishga tushiring
2. Loyihani klonlang
3. Dependencies ni o'rnating: `npm install`
4. .env faylini sozlang
5. Serverni ishga tushiring: `npm run dev`

## API Endpoints

### Autentifikatsiya
- POST `/api/register` - Ro'yxatdan o'tish
- POST `/api/login` - Login qilish

### Foydalanuvchilar
- GET `/api/profile` - O'z profilini ko'rish
- GET `/api/users` - Barcha foydalanuvchilar (manager uchun)
- PUT `/api/users/:userId/role` - Rol o'zgartirish (manager uchun)

## Foydalanuvchi turlari

### Jismoniy shaxs
- firstName (Ism)
- lastName (Familiya)
- email
- phone
- address
- city
- password

### Yuridik shaxs
- companyName (Kompaniya nomi)
- inn
- contactPerson (Kontakt shaxs)
- email
- website
- phone
- address
- city
- password

## Rollar
- `user` - Oddiy foydalanuvchi
- `master` - Usta
- `manager` - Admin/Manager
