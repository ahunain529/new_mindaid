import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';

const BOARD_SIZE = 8;
const CELL_SIZE = Dimensions.get('window').width / 9; // Slightly smaller to fit screen better

const Checkers = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 for red, 2 for black
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    
    // Place red pieces (player 1)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = 1;
        }
      }
    }
    
    // Place black pieces (player 2)
    for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = 2;
        }
      }
    }
    
    setBoard(newBoard);
    setGameOver(false);
    setCurrentPlayer(1);
    setSelectedPiece(null);
  };

  const handlePiecePress = (row, col) => {
    if (gameOver) return;

    const piece = board[row][col];
    
    // Select piece
    if (piece === currentPlayer && !selectedPiece) {
      setSelectedPiece({ row, col });
      return;
    }

    // Move piece
    if (selectedPiece && isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
      setSelectedPiece(null);
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      checkWinCondition();
    } else if (piece === currentPlayer) {
      setSelectedPiece({ row, col });
    } else {
      setSelectedPiece(null);
    }
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    if (board[toRow][toCol] !== 0) return false;
    
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Normal move
    if (colDiff === 1 && 
        ((currentPlayer === 1 && rowDiff === 1) || 
         (currentPlayer === 2 && rowDiff === -1))) {
      return true;
    }
    
    // Capture move
    if (colDiff === 2 && Math.abs(rowDiff) === 2) {
      const jumpedRow = fromRow + rowDiff / 2;
      const jumpedCol = fromCol + (toCol - fromCol) / 2;
      const jumpedPiece = board[jumpedRow][jumpedCol];
      
      return jumpedPiece !== 0 && jumpedPiece !== currentPlayer;
    }
    
    return false;
  };

  const movePiece = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = [...board];
    
    newBoard[toRow][toCol] = currentPlayer;
    newBoard[fromRow][fromCol] = 0;
    
    if (Math.abs(toCol - fromCol) === 2) {
      const jumpedRow = fromRow + (toRow - fromRow) / 2;
      const jumpedCol = fromCol + (toCol - fromCol) / 2;
      newBoard[jumpedRow][jumpedCol] = 0;
    }
    
    setBoard(newBoard);
  };

  const checkWinCondition = () => {
    let player1Pieces = 0;
    let player2Pieces = 0;

    board.forEach(row => {
      row.forEach(cell => {
        if (cell === 1) player1Pieces++;
        if (cell === 2) player2Pieces++;
      });
    });

    if (player1Pieces === 0) {
      Alert.alert('Game Over', 'Black wins!');
      setGameOver(true);
    } else if (player2Pieces === 0) {
      Alert.alert('Game Over', 'Red wins!');
      setGameOver(true);
    }
  };

  const renderCell = (row, col) => {
    const piece = board[row][col];
    const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
    const cellColor = (row + col) % 2 === 0 ? '#FFE4B5' : '#8B4513';

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          { backgroundColor: cellColor },
          isSelected && styles.selectedCell,
        ]}
        onPress={() => handlePiecePress(row, col)}
      >
        {piece !== 0 && (
          <View style={[
            styles.piece,
            { backgroundColor: piece === 1 ? '#FF0000' : '#000000' },
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameInfo}>
        <Text style={styles.turnText}>
          {gameOver ? 'Game Over' : `${currentPlayer === 1 ? 'Red' : 'Black'}'s Turn`}
        </Text>
      </View>

      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={initializeBoard}
      >
        <Text style={styles.resetButtonText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  gameInfo: {
    marginBottom: 20,
  },
  turnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  board: {
    borderWidth: 2,
    borderColor: '#8B4513',
    backgroundColor: '#FFE4B5',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCell: {
    backgroundColor: '#FFD700',
  },
  piece: {
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    borderRadius: CELL_SIZE * 0.4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6B48FF',
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Checkers; 