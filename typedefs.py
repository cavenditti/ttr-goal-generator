from dataclasses import dataclass


class City(str):
    pass


@dataclass
class Edge:
    city_a: City
    city_b: City
    weight: int
    locomotives: int
    is_double: bool
    is_gallery: bool


def cities_in_route(edges: list[Edge]):
    if len(edges) < 1:
        return []
    return [e.city_a for e in edges] + [edges[-1].city_b]


@dataclass
class Route:
    city_a: City
    city_b: City
    weight: int

    def __repr__(self) -> str:
        return f"Route({self.city_a} — {self.city_b}, w: {self.weight})"
