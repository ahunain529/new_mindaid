import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ScrollView,
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

const motivationalQuotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Peace comes from within. Do not seek it without.",
    author: "Buddha"
  },
  {
    quote: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
    author: "Unknown"
  },
  {
    quote: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama"
  },
  {
    quote: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  },
  {
    quote: "Every moment is a fresh beginning.",
    author: "T.S. Eliot"
  },
  {
    quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson"
  },
  {
    quote: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    quote: "The best way to predict your future is to create it.",
    author: "Abraham Lincoln"
  },
  {
    quote: "Be the change you wish to see in the world.",
    author: "Mahatma Gandhi"
  }
];

const recommendedBooks = [
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    description: "A guide to spiritual enlightenment and living in the present moment"
  },
  {
    title: "Mindfulness in Plain English",
    author: "Bhante Gunaratana",
    description: "A classic introduction to mindfulness meditation"
  },
  {
    title: "The Miracle of Mindfulness",
    author: "Thich Nhat Hanh",
    description: "An introduction to the practice of meditation and mindful living"
  },
  {
    title: "The Untethered Soul",
    author: "Michael A. Singer",
    description: "A journey beyond yourself to self-realization"
  }
];

export default function HomeScreen() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prevQuote => {
        const currentIndex = motivationalQuotes.indexOf(prevQuote);
        const nextIndex = (currentIndex + 1) % motivationalQuotes.length;
        return motivationalQuotes[nextIndex];
      });
    }, 10000);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to MindAid</Text>
        <Text style={styles.headerSubtitle}>Find your inner peace</Text>
      </View>

      {/* Quote of the Day */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>"{currentQuote.quote}"</Text>
        <Text style={styles.quoteAuthor}>- {currentQuote.author}</Text>
      </View>

      {/* All Quotes Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Daily Inspiration</Text>
        {motivationalQuotes.map((quote, index) => (
          <View key={index} style={styles.quoteCard}>
            <Text style={styles.quoteCardText}>"{quote.quote}"</Text>
            <Text style={styles.quoteCardAuthor}>- {quote.author}</Text>
          </View>
        ))}
      </View>

      {/* Recommended Books Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recommended Books</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendedBooks.map((book, index) => (
            <TouchableOpacity key={index} style={styles.bookCard}>
              <View style={styles.bookImageContainer}>
                <Ionicons name="book" size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
              <Text style={styles.bookDescription} numberOfLines={2}>
                {book.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  quoteContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: theme.colors.text,
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'right',
  },
  sectionContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  quoteCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quoteCardText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: theme.colors.text,
    marginBottom: 8,
  },
  quoteCardAuthor: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'right',
  },
  bookCard: {
    width: 150,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  bookDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
}); 