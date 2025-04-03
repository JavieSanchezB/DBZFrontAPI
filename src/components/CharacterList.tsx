import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ViewStyle } from 'react-native';
import { API_CONFIG } from '../config/api';
import CharacterCard from './CharacterCard';
import Loading from './Loading';
import Error from './Error';

interface Character {
  id: string;
  name: string;
  image: string;
  ki: number;
  maxKi: number;
  race: string;
  gender: string;
  affiliation: string;
}

const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    setLoading(true); // Indicamos que estamos cargando
  
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.characters}`);
  
      if (!response.ok) {
        throw (`Failed to fetch characters: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false); // Finalizamos la carga
    }
  };
  

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={characters}
        renderItem={({ item }) => <CharacterCard character={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

interface Styles {
  container: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
});

export default CharacterList;