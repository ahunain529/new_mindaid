import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

export default function AnimatedSplash({ onAnimationComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const letterAnims = useRef([...Array(7)].map(() => new Animated.Value(0))).current;
  const sloganAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered letter animations
    Animated.stagger(150, [
      ...letterAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ),
      // Animate slogan after letters
      Animated.timing(sloganAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Delay before completing the splash screen
      setTimeout(onAnimationComplete, 800);
    });
  }, []);

  const letters = 'MindAid'.split('');

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.lettersContainer}>
          {letters.map((letter, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.letter,
                {
                  transform: [
                    {
                      translateY: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    {
                      scale: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                  opacity: letterAnims[index],
                },
                index === 4 && styles.coloredLetter, // 'A' in MindAid
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        <Animated.Text
          style={[
            styles.slogan,
            {
              opacity: sloganAnim,
              transform: [
                {
                  translateY: sloganAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          don't mind it
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  lettersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  letter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 2,
  },
  coloredLetter: {
    color: theme.colors.accent,
  },
  slogan: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 20,
    fontStyle: 'italic',
    letterSpacing: 2,
    marginTop: 10,
  },
}); 