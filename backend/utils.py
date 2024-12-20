import polars as pl

from typedefs import City


def cities(df: pl.DataFrame) -> set[City]:
    a = df.select(pl.col("city_a").unique())[:, "city_a"]
    b = df.select(pl.col("city_b").unique())[:, "city_b"]
    return set(a.to_list()) | set(b.to_list())


def neighbours(df: pl.DataFrame, city: City) -> set[City]:
    edges = df.filter((pl.col("city_a") == city) | (pl.col("city_b") == city))
    a = set(edges["city_a"].to_list())
    b = set(edges["city_b"].to_list())
    return a | b


def neighbours_2nd(df: pl.DataFrame, city: City) -> set[City]:
    n = list(neighbours(df, city))
    return set([a for c in n for a in neighbours(df, c)])


def node_degrees(df: pl.DataFrame):
    all_cities = cities(df)
    return {c: len(neighbours(df, c)) - 1 for c in all_cities}

def node_degrees_2nd(df: pl.DataFrame):
    all_cities = cities(df)
    return {c: len(neighbours_2nd(df, c)) - 1 for c in all_cities}
