from dijkstra import compute_pairwise_distances
import polars as pl

from typedefs import Route


def cities(df: pl.DataFrame) -> set[str]:
    a = df.select(pl.col("city_a").unique())[:, "city_a"]
    b = df.select(pl.col("city_b").unique())[:, "city_b"]
    return set(a.to_list()) | set(b.to_list())


def cached_random_route(
    distances_df: pl.DataFrame,
    min_weight: int,
    max_weight: int,
) -> Route:
    """
    Find a random route with the given weight from the distances DataFrame.
    """

    selected = distances_df.filter(
        (pl.col("distance") >= min_weight) & (pl.col("distance") <= max_weight)
    ).sample(n=1)

    return Route(
        city_a=selected[0, "source"],
        city_b=selected[0, "target"],
        weight=round(selected[0, "distance"]),
    )


def random_route(
    df: pl.DataFrame,
    min_weight: int,
    max_weight: int,
    weight_col: str = "weight",
) -> Route:
    """
    Find a random route with the given weight from the DataFrame.

    Each city may appear at most one time in the route.
    Each row of the DataFrame has the following structure:
    ```
    {
        "city_a": "Edinburgh",
        "city_b": "London",
        "weight": 4,
        "locomotives": 0,
        "is_double": True,
        "is_gallery": False,
        ...,
    }
    ```
    """

    return cached_random_route(
        compute_pairwise_distances(
            df,
            source_col="city_a",
            target_col="city_b",
            weight_col=weight_col,
        ),
        min_weight,
        max_weight,
    )
