from dataclasses import asdict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import polars as pl

from dijkstra import compute_pairwise_distances
from generator import cached_random_route

WEIGHT_MULT = 1
LOCOMOTIVES_MULT = 1
GALLERY_MULT = 2

SCALE_FACTOR = 0.8

DF = pl.read_excel("./routes.xlsx")
DF2 = DF.with_columns(
    (
        SCALE_FACTOR
        * (
            WEIGHT_MULT * pl.col("weight")
            + LOCOMOTIVES_MULT * (pl.col("locomotives"))
            + GALLERY_MULT * pl.col("is_gallery")
        )
    ).alias("cost")
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


DISTANCES = compute_pairwise_distances(
    DF2,
    source_col="city_a",
    target_col="city_b",
    weight_col="cost",
)


@app.get("/")
async def root():
    return asdict(cached_random_route(DISTANCES, 7, 14))
