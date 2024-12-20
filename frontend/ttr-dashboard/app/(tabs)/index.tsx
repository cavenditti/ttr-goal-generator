import * as React from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Card, Dialog, IconButton, Text } from 'react-native-paper';
import { Portal, Button } from 'react-native-paper';

interface Route {
  city_a: string
  city_b: string
  weight: number
}

interface Player {
  name: string
  score: number
  routes: Route[]
}

function PlayerOverview(
  {
    dialogState,
    player,
  }: {
    dialogState: any,
    player: Player,
  }) {
  const [visible, setVisible] = dialogState;

  const hideDialog = () => setVisible(false);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={{ width: "50%", height: "80%", marginLeft: "25%", padding: 10 }}>
        <Dialog.Title> {player.name} </Dialog.Title>
        <Dialog.Title style={{ position: "absolute", right: 0, top: 20 }}> {player.score} pts </Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView style={{ width: "100%", gap: 20 }}>
            {
              player.routes.map((r, i) =>
                <View key={i} style={{ paddingVertical: 30 }}>
                  <GoalCard route={r} showDialog={() => { }} setSelectedRoute={(route: Route) => { }} />
                </View>
              )
            }
          </ScrollView>
        </Dialog.ScrollArea>
      </Dialog>
    </Portal >
  );
};

const PlayerSelect = (
  {
    route,
    dialogState,
    players,
    setPlayers,
  }: {
    route: Route,
    dialogState: any,
    players: Player[],
    setPlayers: any
  }) => {
  const [visible, setVisible] = dialogState;

  const hideDialog = () => setVisible(false);

  const set = (player_index: number) => {
    let new_players = players;
    new_players[player_index] = {
      ...new_players[player_index],
      score: + new_players[player_index].score + route.weight,
      routes: new_players[player_index].routes.concat(route)
    };
    setPlayers(new_players);
    hideDialog();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={{ width: "50%", minHeight: "50%", marginLeft: "25%", paddingHorizontal: "10%", paddingTop: "8%", paddingBottom: "3%" }}>
        <View style={{ position: "absolute", top: 10 }}>
          <Text>Assign</Text>
          <Text><Text variant="titleLarge">{route.city_a} — {route.city_b}</Text>    ({route.weight} pts)</Text>
        </View>
        {
          players.map((p, i) => <Button labelStyle={{ fontSize: 18, marginVertical: 22 }} icon="account" key={p.name} mode="contained" style={{ margin: 20 }} onPress={() => { set(i) }}>{p.name}</Button>)
        }
      </Dialog>
    </Portal >
  );
};

const RefreshConfirm = ({ dialogState }: { dialogState: any }) => {
  const [visible, setVisible] = dialogState;

  const hideDialog = () => setVisible(false);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={{ width: "50%", height: "35%", marginLeft: "25%", paddingHorizontal: "12%", borderColor: "red", borderWidth: 2 }}>
        <Text variant="titleLarge" style={{ alignSelf: "center", paddingVertical: 50 }}>Are you sure?</Text>
        <Button mode="contained" style={{ backgroundColor: "#f44", marginVertical: 20 }} onPress={() => window.location.reload()}>Yes</Button>
        <Button mode="contained" onPress={hideDialog}>No</Button>
      </Dialog>
    </Portal >
  );
};

function GoalCard({ route, showDialog, setSelectedRoute }: { route: Route, showDialog: any, setSelectedRoute: any }) {

  return <Card
    style={styles.card}
    onPress={() => {
      setSelectedRoute(route);
      showDialog();
    }}
  >
    <ImageBackground
      source={require("@/assets/images/background.jpg")}
      style={{
        width: 950,
        height: 600,
        position: "absolute",
        top: -40,
        right: -450,
        opacity: 0.1,
      }}
    />
    <View style={{ width: "100%", height: "100%", flexDirection: "column", alignContent: "space-between" }}>
      <View style={styles.mainContainer}>
        <Text style={{ fontSize: 32, }}>{route.city_a}</Text>
        <Text style={{ fontSize: 32, }}>{route.city_b}</Text>
      </View>
      <View style={styles.mainContainer}>
        <Text style={{ fontSize: 64, fontWeight: "bold", color: "red", position: "absolute", right: 0 }}>{route.weight}</Text>
      </View>
    </View>
  </Card>
}

function ScoreCard({ player }: { player: Player }) {
  const [visible, setVisible] = React.useState(false);

  const player_overview = <PlayerOverview dialogState={[visible, setVisible]} player={player} />;

  const showDialog = () => { setVisible(true) };

  return <Card onPress={showDialog} mode="contained" style={{ height: 38 }}>
    <Card.Title title={`${player.name}: ${player.score}`} />
    {player_overview}
  </Card>
}

export default function HomeScreen() {
  const [visible, setVisible] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [selectedRoute, setSelectedRoute] = React.useState({ city_a: "Roma", city_b: "Venezia", weight: 2 });
  const [players, setPlayers] = React.useState([
    {
      name: "P1",
      score: 0,
      routes: [],
    },
    {
      name: "P2",
      score: 0,
      routes: [],
    },
    {
      name: "P3",
      score: 0,
      routes: [],
    },
  ]);

  React.useEffect(() => {
      const i = routes.findIndex((r) => { return r.city_a === selectedRoute.city_a && r.city_b === selectedRoute.city_b && r.weight === selectedRoute.weight });
      replaceRoute(i);
  }, [players, selectedRoute]);

  const dialog = <PlayerSelect
    route={selectedRoute}
    dialogState={[visible, setVisible]}
    players={players}
    setPlayers={setPlayers}
  />;
  const refreshConfirm = <RefreshConfirm dialogState={[confirmVisible, setConfirmVisible]} />

  const showDialog = () => setVisible(true);
  const showRefreshConfirm = () => setConfirmVisible(true);

  const [routes, setRoutes] = React.useState<Route[]>([]);


  const addRandomRoute = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000',
      );
      const json = await response.json();
      console.log(json);
      setRoutes((old_routes) => { return old_routes.concat(json) });
    } catch (error) {
      console.error(error);
    }
  };

  const replaceRoute = async (index: number) => {
    try {
      const response = await fetch(
        'http://localhost:8000',
      );
      const json = await response.json();
      console.log(json);
      setRoutes((old_routes) => {
        let new_routes = old_routes;
        new_routes[index] = json;
        return new_routes;
      });
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    for (let i = 0; i < 6; i++) {
      addRandomRoute();
    }
  }, []);

  return (
    <ThemedView style={styles.mainContainer}>

      <ImageBackground
        source={require("@/assets/images/background.jpg")}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          opacity: 0.025,
        }}
      />

      <View style={styles.titleContainer}>
        {
          players.map((p) => <ScoreCard key={p.name} player={p} />)
        }
      </View>

      <View style={styles.column}>
        <View style={styles.row}>
          {
            routes.slice(0, 3).map(
              (r, i) => <GoalCard key={i} route={r} showDialog={showDialog} setSelectedRoute={setSelectedRoute} />
            )
          }
        </View>
        <View style={styles.row}>
          {
            routes.slice(3, 6).map(
              (r, i) => <GoalCard key={i} route={r} showDialog={showDialog} setSelectedRoute={setSelectedRoute} />
            )
          }
        </View>
        {dialog}
      </View>
      <IconButton
        disabled
        icon="account-edit"
        mode="contained"
        style={{ position: 'absolute', right: 30, bottom: 10 }}
      />
      <IconButton
        icon="refresh"
        mode="contained"
        style={{ position: 'absolute', left: 30, bottom: 10, backgroundColor: "#f44" }}
        onPress={showRefreshConfirm}
      />
      {refreshConfirm}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    width: "100%",
    height: "6%",
    flexDirection: "row",
    gap: 10,
    alignContent: "space-between",
    justifyContent: "space-evenly",
    paddingTop: "1%",
    marginTop: 20,
  },
  row: {
    width: "100%",
    flex: 3,
    flexDirection: "row",
    gap: 8,
  },
  column: {
    width: "100%",
    flex: 2,
    flexDirection: "column",
    gap: 8,
  },
  card: {
    height: "65%",
    width: "30%",
    minWidth: 400,
    minHeight: 200,
    margin: "auto",
    overflow: "hidden",
    padding: 40,
  },
});
