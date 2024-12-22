import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

const CARD_PAIRS = [
  { id: 1, icon: 'heart-outline' },
  { id: 2, icon: 'star-outline' },
  { id: 3, icon: 'flower-outline' },
  { id: 4, icon: 'diamond-outline' },
  { id: 5, icon: 'moon-outline' },
  { id: 6, icon: 'sunny-outline' },
  { id: 7, icon: 'leaf-outline' },
  { id: 8, icon: 'planet-outline' },
];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [bestScore, setBestScore] = useState(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...CARD_PAIRS, ...CARD_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardPress = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(moves + 1);

      const [first, second] = newFlipped;
      if (cards[first].id === cards[second].id) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const renderCard = (card, index) => {
    const isFlipped = flipped.includes(index) || matched.includes(index);
    const scale = new Animated.Value(isFlipped ? 1 : 0.8);

    Animated.spring(scale, {
      toValue: isFlipped ? 1 : 0.8,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    return (
      <TouchableOpacity
        key={index}
        style={[styles.card, isFlipped && styles.cardFlipped]}
        onPress={() => handleCardPress(index)}
        disabled={disabled}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          {isFlipped ? (
            <Ionicons 
              name={card.icon} 
              size={32} 
              color={theme.colors.primary}
              style={styles.cardIcon}
            />
          ) : (
            <View style={styles.cardBack} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.moves}>Moves: {moves}</Text>
        <Text style={styles.bestScore}>Best: {bestScore || '-'}</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={initializeGame}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => renderCard(card, index))}
      </View>

      {matched.length === cards.length && (
        <View style={styles.winMessage}>
          <Text style={styles.winText}>
            Congratulations!{'\n'}You won in {moves} moves!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  moves: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: Dimensions.get('window').width / 4 - 20,
    height: Dimensions.get('window').width / 4 - 20,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardFlipped: {
    backgroundColor: '#f8f9fa',
  },
  cardBack: {
    width: '80%',
    height: '80%',
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
    borderRadius: 8,
  },
  winMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  bestScore: {
    fontSize: 16,
    color: theme.colors.text,
  },
  cardIcon: {
    transform: [{ scale: 1.2 }],
  },
}); 