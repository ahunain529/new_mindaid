import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
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

const words = [
  'MINDFULNESS',
  'MEDITATION',
  'PEACEFUL',
  'HARMONY',
  'BALANCE',
  'SERENITY',
  'TRANQUIL',
  'WELLNESS',
  'HEALING',
  'CALMNESS',
];

export default function WordScramble() {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [shake] = useState(new Animated.Value(0));

  useEffect(() => {
    newWord();
  }, []);

  const scrambleWord = (word) => {
    return word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };

  const newWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setUserInput('');
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkAnswer = () => {
    if (userInput.toUpperCase() === currentWord) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      Alert.alert(
        '🎉 Correct!',
        'Well done! Ready for the next word?',
        [{ text: 'Next Word', onPress: newWord }],
        { cancelable: false }
      );
    } else {
      shakeAnimation();
      Alert.alert('Try Again', 'That\'s not correct');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>
      </View>

      <View style={styles.gameContainer}>
        <Text style={styles.instruction}>Unscramble this word:</Text>
        <Animated.View
          style={[
            styles.wordContainer,
            { transform: [{ translateX: shake }] }
          ]}
        >
          <Text style={styles.scrambledWord}>
            {scrambledWord.split('').join(' ')}
          </Text>
        </Animated.View>

        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your answer"
          placeholderTextColor="#999"
          autoCapitalize="characters"
          maxLength={currentWord.length}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={checkAnswer}
          >
            <Text style={styles.buttonText}>Check Answer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newWordButton}
            onPress={newWord}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    minWidth: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 20,
    opacity: 0.8,
  },
  wordContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    minWidth: '80%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrambledWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 5,
  },
  input: {
    backgroundColor: 'white',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  checkButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  newWordButton: {
    backgroundColor: theme.colors.accent,
    padding: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 