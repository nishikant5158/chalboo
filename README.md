CHALBOO – Travel Buddy Finder
============================

Chalboo is a full-stack web application that helps travelers find compatible travel partners, create travel groups, chat in real-time, and rate each other after trips.

This project demonstrates complete Full Stack Development using FastAPI, React, and MongoDB.

--------------------------------------------------
PROJECT AGENDA
--------------------------------------------------

The main purpose of this project is to:

- Help solo travelers find travel buddies
- Allow users to create and join travel groups
- Enable secure authentication
- Provide real-time group chat
- Build trust using ratings and reviews
- Demonstrate backend + frontend integration

--------------------------------------------------
FEATURES
--------------------------------------------------

- User Signup & Login (JWT Authentication)
- Create & Search Travel Groups
- Join Request System (Approve / Reject)
- My Groups Dashboard
- Real-time Group Chat (WebSocket)
- User Ratings & Reviews
- Secure REST APIs

--------------------------------------------------
TECH STACK
--------------------------------------------------

Backend:
- FastAPI
- MongoDB
- Motor (Async MongoDB)
- JWT Authentication
- Uvicorn

Frontend:
- React
- Tailwind CSS
- Context API
- WebSockets

--------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------

chalboo/
│
├── backend/
│   ├── server.py
│   ├── auth.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
│
└── README.txt

--------------------------------------------------
ENVIRONMENT VARIABLES
--------------------------------------------------

Backend (.env):
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*

Frontend (.env):
REACT_APP_BACKEND_URL=http://127.0.0.1:8000

--------------------------------------------------
HOW TO RUN THE PROJECT (STEP BY STEP)
--------------------------------------------------

STEP 1: Start MongoDB
---------------------
mongod

--------------------------------------------------

STEP 2: Run Backend (FastAPI)
-----------------------------
cd backend,
  python -m venv venv,
  venv\Scripts\activate,
pip install -r requirements.txt,
uvicorn server:app --reload

Backend URL:
http://127.0.0.1:8000

Swagger API Docs:
http://127.0.0.1:8000/docs

--------------------------------------------------

STEP 3: Run Frontend (React)
----------------------------
cd frontend,
npm install,
npm start

Frontend URL:
http://localhost:3000

--------------------------------------------------
API OVERVIEW
--------------------------------------------------

Authentication:
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

Groups:
- POST /api/groups
- GET /api/groups
- GET /api/groups/{group_id}
- GET /api/my-groups

Join Requests:
- POST /api/groups/{group_id}/join-request
- GET /api/groups/{group_id}/join-requests
- POST /api/groups/{group_id}/join-requests/{request_id}/approve
- POST /api/groups/{group_id}/join-requests/{request_id}/reject

Chat:
- WebSocket /api/ws/{group_id}/{token}

Ratings:
- POST /api/ratings
- GET /api/users/{user_id}/ratings

--------------------------------------------------
IMPORTANT NOTES
--------------------------------------------------

- 404 on "/" is normal (API uses /api)
- MongoDB must be running before backend starts
- Backend must start before frontend

--------------------------------------------------
AUTHOR
--------------------------------------------------

GitHub Repository:
https://github.com/nishikant5158/chalboo

--------------------------------------------------
SUPPORT
--------------------------------------------------

If you like this project, give it a ⭐ on GitHub!
