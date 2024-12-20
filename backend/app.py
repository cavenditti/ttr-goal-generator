from dataclasses import asdict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import polars as pl

from dijkstra import compute_pairwise_distances
from generator import cached_random_route
from utils import node_degrees, node_degrees_2nd

WEIGHT_MULT = 1
LOCOMOTIVES_MULT = 1
GALLERY_MULT = 2

SCALE_FACTOR = 0.8

DF = pl.read_excel("../routes.xlsx")
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

ND2 = (
    pl.DataFrame(node_degrees_2nd(DF))
    .transpose(include_header=True, header_name="city", column_names=["nd2"])
    .with_columns((pl.col("nd2").max() - pl.col("nd2")) * 0.1)
)


@app.get("/")
async def root():
    route = cached_random_route(DISTANCES, 5, 13)
    route.weight = round(
        route.weight
        + ND2.filter(pl.col("city") == route.city_a)[0, "nd2"]
        + ND2.filter(pl.col("city") == route.city_b)[0, "nd2"]
    )
    return asdict(route)
