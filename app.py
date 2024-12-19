from dataclasses import asdict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import polars as pl

from generator import random_route

DF = pl.read_excel("./routes.xlsx")
DF2 = DF.with_columns(
    (pl.col("weight") + (pl.col("locomotives")) + pl.col("is_gallery")).alias("cost")
).sort("cost")

origins = [
    "http://localhost",
    "http://localhost:8081",
    "localhost:8081",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
async def root():
    return asdict(random_route(DF2, 4, 12, weight_col="cost"))
