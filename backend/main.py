from fastapi import FastAPI
try:
    from .database import create_db_and_tables
    from .routers import products, auth, sales, dashboard, chatbot, clients, settings, public, quotes
except ImportError:
    from database import create_db_and_tables
    from routers import products, auth, sales, dashboard, chatbot, clients, settings, public, quotes
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(auth.router)
app.include_router(sales.router)
app.include_router(dashboard.router)
app.include_router(chatbot.router)
app.include_router(clients.router)
app.include_router(settings.router)
app.include_router(public.router)
app.include_router(quotes.router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Viveiro de Mudas API"}
