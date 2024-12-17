from dataclasses import asdict
from fastapi import FastAPI
import polars as pl

from generator import random_route

DF = pl.read_excel("./routes.xlsx")
DF2 = DF.with_columns((pl.col("weight") + (pl.col("locomotives")) + pl.col("is_gallery")).alias("cost")).sort("cost")


app = FastAPI()


@app.get("/")
async def root():
    return asdict(random_route(DF2, 4, 12, weight_col="cost"))
