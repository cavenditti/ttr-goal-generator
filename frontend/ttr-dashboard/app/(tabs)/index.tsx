import * as React from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Card, Dialog, Text } from 'react-native-paper';
import { Portal, Button } from 'react-native-paper';

interface Route {
  from: string
  to: string
  value: number
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
                  <GoalCard route={r} showDialog={() => { }} />
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
    setPlayers
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
      score: + new_players[player_index].score + route.value,
      routes: new_players[player_index].routes.concat(route)
    };
    setPlayers(new_players);
    hideDialog();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={{ width: "50%", height: "50%", marginLeft: "25%", padding: "12%" }}>
        <View style={{ position: "absolute", top: 10 }}>
          <Text>Assign</Text>
          <Text><Text variant="titleLarge">{route.from} — {route.to}</Text>    ({route.value} pts)</Text>
        </View>
        {
          players.map((p, i) => <Button icon="account" key={p.name} mode="contained" style={{ margin: 10 }} onPress={() => { set(i) }}>{p.name}</Button>)
        }
      </Dialog>
    </Portal >
  );
};

function GoalCard({ route, showDialog }: { route: Route, showDialog: any }) {

  return <Card
    style={styles.card}
    onPress={() => { showDialog() }}
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
        <Text style={{ fontSize: 32, }}>{`${route.from} — ${route.to}`}</Text>
      </View>
      <View style={styles.mainContainer}>
        <Text style={{ fontSize: 64, fontWeight: "bold", color: "red", position: "absolute", right: 0 }}>{route.value}</Text>
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
  const [selectedRoute, setSelectedRoute] = React.useState({ from: "Roma", to: "Venezia", value: 2 });
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
  const dialog = <PlayerSelect
    route={selectedRoute}
    dialogState={[visible, setVisible]}
    players={players}
    setPlayers={setPlayers}
  />;

  const showDialog = () => setVisible(true);

  const example_route: Route = {
    from: "Roma",
    to: "Venezia",
    value: 2,
  };

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
          <GoalCard route={example_route} showDialog={showDialog} />
          <GoalCard route={example_route} showDialog={showDialog} />
          <GoalCard route={example_route} showDialog={showDialog} />
        </View>
        <View style={styles.row}>
          <GoalCard route={example_route} showDialog={showDialog} />
          <GoalCard route={example_route} showDialog={showDialog} />
          <GoalCard route={example_route} showDialog={showDialog} />
        </View>
        {dialog}
      </View>
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