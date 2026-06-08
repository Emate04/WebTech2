# Nyilvántartó Rendszer

Angular + Node.js + MongoDB alapú terméknyilvántartó alkalmazás.

## Telepítés

**Backend**
```bash
cd backend
npm install
node server.js
```

**Frontend**
```bash
cd frontend
npm install
ng serve
```

Az alkalmazás `http://localhost:4200` címen érhető el, a backend `http://localhost:3000` porton fut.

MongoDB connection string alapértelmezetten: `mongodb://localhost:27017/inventory_db`

Környezeti változók (opcionális):
```
PORT=3000
MONGO_URI=mongodb://...
JWT_SECRET=...
```

## Funkciók

- Regisztráció és bejelentkezés JWT alapon
- Termékek listázása, hozzáadása, szerkesztése, törlése
- Mezővalidáció frontend és backend oldalon
- Védett útvonalak auth guard segítségével
