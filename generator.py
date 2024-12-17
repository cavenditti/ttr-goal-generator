import polars as pl

from typedefs import City, Edge, Route, cities_in_route


def cities(df: pl.DataFrame) -> set[str]:
    a = df.select(pl.col("city_a").unique())[:, "city_a"]
    b = df.select(pl.col("city_b").unique())[:, "city_b"]
    return set(a.to_list()) | set(b.to_list())


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

    # the route we're building
    route = []

    # the total weight up to now
    weight = 0

    # select a random starting city
    first_city = pl.Series(list(cities(df))).sample(n=1)[0]
    latest = first_city

    # do while wight < min_weight
    while True:
        # get all routes containing that city
        possible_next_paths = df.filter(
            (pl.col("city_a") == latest) | (pl.col("city_b") == latest)
        )

        # remove routes that would make the weight exced max_weight
        possible_next_paths = possible_next_paths.filter(
            pl.col(weight_col) + weight <= max_weight
        )

        # exclude paths to every already visited city from possible_next_paths
        # (but accept latest one)
        for city in cities_in_route(route)[:-1]:
            possible_next_paths = possible_next_paths.filter(
                (pl.col("city_a") != city) & (pl.col("city_b") != city)
            )

        # select a random one from possible_next_paths and add it to the route
        try:
            selected = possible_next_paths.sample(n=1)
        except pl.exceptions.ShapeError:
            # There's no valid next path from here. Just return
            break

        if selected[weight_col][0] + weight > max_weight:
            break

        # order cities according to the route we are following
        city_a, city_b = (
            (
                selected["city_a"][0],
                selected["city_b"][0],
            )
            if selected["city_a"][0] == latest
            else (
                selected["city_b"][0],
                selected["city_a"][0],
            )
        )

        route.append(
            Edge(
                city_a=city_a,
                city_b=city_b,
                weight=selected[weight_col][0],
                locomotives=selected["locomotives"][0],
                is_double=selected["is_double"][0],
                is_gallery=selected["is_gallery"][0],
            )
        )

        # update weight
        weight += selected[weight_col][0]

        # update last city
        latest = city_b

        # randomly break with a probability that increases as we get closer to max_weight
        if weight > min_weight:
            if pl.Series(
                ([False] * (max_weight - weight)) + ([True] * (-min_weight + weight))
            ).sample(n=1)[0]:
                break

    if weight < min_weight or len(route) == 0 or latest == first_city:
        # We didn't find a suitable route. Let's start again.
        # WARNING: doesn't check for impossible parameters and may hang indefinitely
        return random_route(df, min_weight, max_weight, weight_col=weight_col)

    return Route(
        edges=route,
        city_a=first_city,
        city_b=latest,
        weight=weight,
    )
