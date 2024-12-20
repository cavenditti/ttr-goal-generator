import polars as pl
from collections import defaultdict, deque


def compute_pairwise_distances(
    df: pl.DataFrame,
    *,
    source_col: str,
    target_col: str,
    weight_col: str | None = None,
) -> pl.DataFrame:
    """
    Computes pairwise distances on an undirected graph from an adjacency list.

    Parameters:
    - df (pl.DataFrame): Adjacency list representation of the graph.
    - source_col (str): Column name for the source nodes.
    - target_col (str): Column name for the target nodes.
    - weight_col (str, optional): Column name for edge weights. If None, all edges are assumed to have weight 1.

    Returns:
    - pl.DataFrame: Pairwise distances between all nodes.
    """
    # Build graph from the Polars DataFrame
    graph = defaultdict(list)
    for row in df.iter_rows(named=True):
        source = row[source_col]
        target = row[target_col]
        weight = row[weight_col] if weight_col else 1
        graph[source].append((target, weight))
        graph[target].append((source, weight))  # Undirected graph

    # Get all unique nodes
    nodes = set(graph.keys())

    # Function for BFS/modified Dijkstra for unweighted/weighted graphs
    def bfs_dijkstra(start):
        distances = {node: float("inf") for node in nodes}
        distances[start] = 0
        queue = deque([start]) if not weight_col else [(0, start)]

        while queue:
            if weight_col:
                current_dist, current_node = queue.pop(0)  # Pop the front for weighted
            else:
                current_node = queue.popleft()
                current_dist = distances[current_node]

            for neighbor, weight in graph[current_node]:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    if weight_col:
                        queue.append((new_dist, neighbor))
                    else:
                        queue.append(neighbor)

        return distances

    # Compute pairwise distances
    all_distances = []
    for node in nodes:
        distances = bfs_dijkstra(node)
        for target, distance in distances.items():
            all_distances.append(
                {"source": node, "target": target, "distance": distance}
            )

    # Return as a Polars DataFrame
    return pl.DataFrame(all_distances)


if __name__ == "__main__":
    # Example usage
    # Create a sample adjacency list
    adj_list = pl.DataFrame(
        {
            "source": ["A", "A", "B", "B", "C"],
            "target": ["B", "C", "C", "D", "D"],
            "weight": [1, 2, 1, 3, 1],
        }
    )

    # Compute pairwise distances
    distance_df = compute_pairwise_distances(
        adj_list, source_col="source", target_col="target", weight_col="weight"
    )
    print(distance_df)

