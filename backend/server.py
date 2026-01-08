from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
import random
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
import json

from models import (
    User, UserCreate, UserLogin,
    TravelGroup, TravelGroupCreate,
    JoinRequest, Message, MessageCreate,
    Rating, RatingCreate
)
from auth import (
    get_password_hash, verify_password,
    create_access_token, get_current_user
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


DEFAULT_IMAGE = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"

IMAGE_MAP = {
    "manali": "https://images.unsplash.com/photo-1587502536263-9298e6e1b38b?auto=format&fit=crop&w=1200&q=80",
    "kashmir": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80",
    "goa": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "delhi": "https://images.unsplash.com/photo-1597040663342-45b6af3d91b1?auto=format&fit=crop&w=1200&q=80",
    "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
    "pune": "https://images.unsplash.com/photo-1621674058194-3f6c76b1c3fd?auto=format&fit=crop&w=1200&q=80",
}


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, group_id: str, user_id: str):
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = {}
        self.active_connections[group_id][user_id] = websocket

    def disconnect(self, group_id: str, user_id: str):
        if group_id in self.active_connections:
            self.active_connections[group_id].pop(user_id, None)
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast(self, group_id: str, message: dict):
        if group_id in self.active_connections:
            for user_id, connection in self.active_connections[group_id].items():
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        city=user_data.city,
        age=user_data.age
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password'] = hashed_password
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token(data={"sub": user.id})
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop('password', None)
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    token = create_access_token(data={"sub": user_doc['id']})
    return {"token": token, "user": user_doc}

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return user_doc

@api_router.post("/groups", response_model=TravelGroup)
async def create_group(
    group_data: TravelGroupCreate,
    user_id: str = Depends(get_current_user)
):
    # ✅ 4 spaces (function level)
    destination = group_data.to_location.strip().lower()

    IMAGE_MAP = {
        "manali": "https://unsplash.com/photos/3-women-lying-on-snow-covered-ground-during-daytime-9ttisCSNCOc",
        "kashmir": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80",
        "goa": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "munnar": "https://images.unsplash.com/photo-1580745084180-2f7f8b1d42c6?auto=format&fit=crop&w=1200&q=80",
        "ooty": "https://images.unsplash.com/photo-1580810736546-2ec6b10b2a44?auto=format&fit=crop&w=1200&q=80",
        "coorg": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
        "nainital":"https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0",


    }

    # ✅ 4 spaces
    image_url = IMAGE_MAP.get(destination)

    # ✅ if block → 8 spaces inside
    if not image_url:
        image_url = f"https://source.unsplash.com/1200x600/?{destination},travel&sig={random.randint(1, 100000)}"

    # ✅ back to 4 spaces
    group = TravelGroup(
        from_location=group_data.from_location,
        to_location=group_data.to_location,
        travel_date=datetime.fromisoformat(group_data.travel_date),
        budget_min=group_data.budget_min,
        budget_max=group_data.budget_max,
        trip_type=group_data.trip_type,
        description=group_data.description,
        max_members=group_data.max_members,
        admin_id=user_id,
        members=[user_id],
        imageUrl=image_url,
    )


    group_doc = group.model_dump()
    group_doc["travel_date"] = group_doc["travel_date"].isoformat()
    group_doc["created_at"] = group_doc["created_at"].isoformat()

    await db.travel_groups.insert_one(group_doc)
    return group


@api_router.get("/groups", response_model=List[TravelGroup])
async def search_groups(
    from_location: Optional[str] = None,
    to_location: Optional[str] = None,
    travel_date: Optional[str] = None
):
    query = {}
    if from_location:
        query['from_location'] = {"$regex": from_location, "$options": "i"}
    if to_location:
        query['to_location'] = {"$regex": to_location, "$options": "i"}
    if travel_date:
        query['travel_date'] = {"$regex": travel_date}
    
    groups = await db.travel_groups.find(query, {"_id": 0}).to_list(100)
    
    for group in groups:
        if isinstance(group.get('travel_date'), str):
            group['travel_date'] = datetime.fromisoformat(group['travel_date'])
        if isinstance(group.get('created_at'), str):
            group['created_at'] = datetime.fromisoformat(group['created_at'])
    
    return groups

@api_router.get("/groups/{group_id}", response_model=TravelGroup)
async def get_group(group_id: str):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if isinstance(group.get('travel_date'), str):
        group['travel_date'] = datetime.fromisoformat(group['travel_date'])
    if isinstance(group.get('created_at'), str):
        group['created_at'] = datetime.fromisoformat(group['created_at'])
    
    return group

@api_router.get("/groups/{group_id}/members", response_model=List[User])
async def get_group_members(group_id: str):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    members = await db.users.find(
        {"id": {"$in": group['members']}},
        {"_id": 0, "password": 0}
    ).to_list(100)
    
    for member in members:
        if isinstance(member.get('created_at'), str):
            member['created_at'] = datetime.fromisoformat(member['created_at'])
    
    return members

@api_router.post("/groups/{group_id}/join-request")
async def create_join_request(group_id: str, user_id: str = Depends(get_current_user)):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if user_id in group['members']:
        raise HTTPException(status_code=400, detail="Already a member")
    
    if len(group['members']) >= group['max_members']:
        raise HTTPException(status_code=400, detail="Group is full")
    
    existing = await db.join_requests.find_one(
        {"user_id": user_id, "group_id": group_id, "status": "pending"},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Join request already exists")
    
    join_request = JoinRequest(user_id=user_id, group_id=group_id)
    request_doc = join_request.model_dump()
    request_doc['created_at'] = request_doc['created_at'].isoformat()
    
    await db.join_requests.insert_one(request_doc)
    return {"message": "Join request sent", "request": join_request}

@api_router.get("/groups/{group_id}/join-requests", response_model=List[dict])
async def get_join_requests(group_id: str, user_id: str = Depends(get_current_user)):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group or group['admin_id'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    requests = await db.join_requests.find(
        {"group_id": group_id, "status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    result = []
    for req in requests:
        user = await db.users.find_one({"id": req['user_id']}, {"_id": 0, "password": 0})
        if user:
            if isinstance(user.get('created_at'), str):
                user['created_at'] = datetime.fromisoformat(user['created_at'])
            result.append({"request": req, "user": user})
    
    return result

@api_router.post("/groups/{group_id}/join-requests/{request_id}/approve")
async def approve_join_request(group_id: str, request_id: str, user_id: str = Depends(get_current_user)):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group or group['admin_id'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    request = await db.join_requests.find_one({"id": request_id}, {"_id": 0})
    if not request or request['group_id'] != group_id:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if len(group['members']) >= group['max_members']:
        raise HTTPException(status_code=400, detail="Group is full")
    
    await db.join_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "approved"}}
    )
    
    await db.travel_groups.update_one(
        {"id": group_id},
        {"$addToSet": {"members": request['user_id']}}
    )
    
    return {"message": "Request approved"}

@api_router.post("/groups/{group_id}/join-requests/{request_id}/reject")
async def reject_join_request(group_id: str, request_id: str, user_id: str = Depends(get_current_user)):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group or group['admin_id'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.join_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "rejected"}}
    )
    
    return {"message": "Request rejected"}

@api_router.get("/my-groups", response_model=List[TravelGroup])
async def get_my_groups(user_id: str = Depends(get_current_user)):
    groups = await db.travel_groups.find(
        {"members": user_id},
        {"_id": 0}
    ).to_list(100)
    
    for group in groups:
        if isinstance(group.get('travel_date'), str):
            group['travel_date'] = datetime.fromisoformat(group['travel_date'])
        if isinstance(group.get('created_at'), str):
            group['created_at'] = datetime.fromisoformat(group['created_at'])
    
    return groups

@api_router.get("/groups/{group_id}/messages", response_model=List[Message])
async def get_messages(group_id: str, user_id: str = Depends(get_current_user)):
    group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
    if not group or user_id not in group['members']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = await db.messages.find(
        {"group_id": group_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

@api_router.websocket("/ws/{group_id}/{token}")
async def websocket_endpoint(websocket: WebSocket, group_id: str, token: str):
    try:
        from auth import decode_token
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        group = await db.travel_groups.find_one({"id": group_id}, {"_id": 0})
        if not group or user_id not in group['members']:
            await websocket.close(code=1008)
            return
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        
        await manager.connect(websocket, group_id, user_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                message = Message(
                    group_id=group_id,
                    sender_id=user_id,
                    sender_name=user['name'],
                    content=message_data['content']
                )
                
                msg_doc = message.model_dump()
                msg_doc['created_at'] = msg_doc['created_at'].isoformat()
                await db.messages.insert_one(msg_doc)
                
                await manager.broadcast(group_id, message.model_dump(mode='json'))
                
        except WebSocketDisconnect:
            manager.disconnect(group_id, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass

@api_router.post("/ratings")
async def create_rating(rating_data: RatingCreate, user_id: str = Depends(get_current_user)):
    if rating_data.to_user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot rate yourself")
    
    group = await db.travel_groups.find_one({"id": rating_data.group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if user_id not in group['members'] or rating_data.to_user_id not in group['members']:
        raise HTTPException(status_code=403, detail="Both users must be group members")
    
    if isinstance(group.get('travel_date'), str):
        travel_date = datetime.fromisoformat(group['travel_date'])
    else:
        travel_date = group['travel_date']
    
    if datetime.now(timezone.utc) < travel_date:
        raise HTTPException(status_code=400, detail="Cannot rate before trip date")
    
    existing = await db.ratings.find_one(
        {
            "from_user_id": user_id,
            "to_user_id": rating_data.to_user_id,
            "group_id": rating_data.group_id
        },
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already rated this user for this trip")
    
    rating = Rating(
        from_user_id=user_id,
        to_user_id=rating_data.to_user_id,
        group_id=rating_data.group_id,
        stars=rating_data.stars,
        review=rating_data.review
    )
    
    rating_doc = rating.model_dump()
    rating_doc['created_at'] = rating_doc['created_at'].isoformat()
    await db.ratings.insert_one(rating_doc)
    
    all_ratings = await db.ratings.find(
        {"to_user_id": rating_data.to_user_id},
        {"_id": 0}
    ).to_list(1000)
    
    avg_rating = sum(r['stars'] for r in all_ratings) / len(all_ratings)
    await db.users.update_one(
        {"id": rating_data.to_user_id},
        {"$set": {"average_rating": avg_rating, "total_ratings": len(all_ratings)}}
    )
    
    return {"message": "Rating submitted", "rating": rating}

@api_router.get("/users/{user_id}/ratings")
async def get_user_ratings(user_id: str):
    ratings = await db.ratings.find(
        {"to_user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    result = []
    for rating in ratings:
        from_user = await db.users.find_one(
            {"id": rating['from_user_id']},
            {"_id": 0, "password": 0}
        )
        if from_user:
            if isinstance(from_user.get('created_at'), str):
                from_user['created_at'] = datetime.fromisoformat(from_user['created_at'])
            result.append({"rating": rating, "from_user": from_user})
    
    return result

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()