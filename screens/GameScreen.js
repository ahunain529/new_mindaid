import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TicTacToe from '../components/games/TicTacToe';
import MemoryGame from '../components/games/MemoryGame';
import WordScramble from '../components/games/WordScramble';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

const games = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    icon: 'grid-outline',
    description: 'Classic X and O game',
    component: TicTacToe,
  },
  {
    id: 'memory',
    name: 'Memory Match',
    icon: 'duplicate-outline',
    description: 'Test your memory by matching pairs',
    component: MemoryGame,
  },
  {
    id: 'wordscramble',
    name: 'Word Scramble',
    icon: 'text-outline',
    description: 'Unscramble the words',
    component: WordScramble,
  },
];

export default function GameScreen() {
  const [selectedGame, setSelectedGame] = React.useState(null);

  const renderGameCard = (game) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameCard}
      onPress={() => setSelectedGame(game)}
    >
      <View style={styles.gameIconContainer}>
        <Ionicons name={game.icon} size={32} color={theme.colors.primary} />
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{game.name}</Text>
        <Text style={styles.gameDescription}>{game.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedGame(null)}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>Games</Text>
          </TouchableOpacity>
          <Text style={styles.gameTitle}>{selectedGame.name}</Text>
        </View>
        <GameComponent />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini Games</Text>
      <Text style={styles.subtitle}>Choose a game to play</Text>
      <ScrollView style={styles.gameList}>
        {games.map(renderGameCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  gameList: {
    padding: 15,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.background,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: 'gray',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.primary,
  },
  gameTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginRight: 32, // To center the text accounting for back button
  },
}); 