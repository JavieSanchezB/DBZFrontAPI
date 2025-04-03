import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';

interface CharacterCardProps {
  character: {
    name: string;
    ki: string | number;
    maxKi: string | number;
    race: string;
    gender: string;
    affiliation: string;
    image: string;
  };
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  const [flipAnim] = useState(new Animated.Value(0));
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }]
  };
  
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }]
  };

  return (
    <TouchableOpacity onPress={flipCard} style={styles.container}>
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <Image
          source={{ uri: character.image }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.info}>
          <Text style={styles.name}>{character.name}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <View style={styles.backInfo}>
          <Text style={styles.infoText}>Ki: {character.ki}</Text>
          <Text style={styles.infoText}>Max Ki: {character.maxKi}</Text>
          <Text style={styles.infoText}>Race: {character.race}</Text>
          <Text style={styles.infoText}>Gender: {character.gender}</Text>
          <Text style={styles.infoText}>Affiliation: {character.affiliation}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    position: 'relative',
    marginBottom: 15,
  },
  card: {
    backfaceVisibility: 'hidden',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBack: {
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
  info: {
    gap: 8,
  },
  backInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
  },
});

export default CharacterCard;