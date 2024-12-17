from dataclasses import dataclass


class City(str):
    pass


@dataclass
class Path:
    city_a: City
    city_b: City
    weight: int
    locomotives: int
    is_double: bool
    is_gallery: bool


def cities_in_route(paths: list[Path]):
    return [a for p in paths for a in [p.city_a, p.city_b]]


@dataclass
class Route:
    paths: list[Path]
    city_a: City
    city_b: City
    weight: int

    def __repr__(self) -> str:
        return f"Route({self.city_a} — {self.city_b}, w: {self.weight}, through: {cities_in_route(self.paths)[1:-1]}"
