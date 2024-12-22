import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
    X: '#4ECDC4', // Cyan for X
    O: '#FF6B6B', // Pink for O
  }
};

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.9;
const CELL_SIZE = BOARD_SIZE / 3;

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handlePress = (index) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const renderCell = (index) => {
    const value = board[index];
    return (
      <TouchableOpacity
        style={[
          styles.cell,
          value && styles.filledCell,
        ]}
        onPress={() => handlePress(index)}
        disabled={!!value || !!calculateWinner(board)}
      >
        {value && (
          <Text style={[
            styles.cellText,
            { color: value === 'X' ? theme.colors.X : theme.colors.O }
          ]}>
            {value}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);
  const status = winner 
    ? `Winner: ${winner}` 
    : isDraw 
    ? "It's a draw!" 
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      
      <Text style={[
        styles.status,
        { color: xIsNext ? theme.colors.X : theme.colors.O }
      ]}>
        {status}
      </Text>

      <View style={styles.board}>
        <View style={styles.row}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.row}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.row}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.resetButton,
          { backgroundColor: xIsNext ? theme.colors.X : theme.colors.O }
        ]}
        onPress={resetGame}
      >
        <Ionicons name="refresh" size={24} color="white" />
        <Text style={styles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  status: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: theme.colors.text,
    borderRadius: 10,
    padding: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 3,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledCell: {
    backgroundColor: '#f8f9fa',
  },
  cellText: {
    fontSize: CELL_SIZE * 0.5,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 