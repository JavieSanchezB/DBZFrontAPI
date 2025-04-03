"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CharacterCard from '../components/CharacterCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import cssStyles from '../styles/CharacterList.module.css';

interface Character {
  id: string;
  name: string;
  ki: string | number;
  maxKi: string | number;
  affiliation: string;
  image: string;
  race: string;
  gender: string;
}

interface Filters {
  affiliation: string;
  minKi: string;
  maxKi: string;
}

interface ApiResponse {
  items: Character[];
  meta: {
    totalPages: number;
  };
}

const Page: React.FC = () => {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    affiliation: '',
    minKi: '',
    maxKi: ''
  });
  const [uniqueAffiliations, setUniqueAffiliations] = useState<string[]>([]);

  const pageSize = 10;

  useEffect(() => {
    const fetchAllCharacters = async () => {
      try {
        setLoading(true);
        let allChars: Character[] = [];
        let nextPage = 1;
        let totalPages = 1;
        
        while (nextPage <= totalPages) {
          const response = await fetch(
            `https://dragonball-api.com/api/characters?page=${nextPage}&limit=100`
          );
          
          if (!response.ok) throw (`Error HTTP: ${response.status}`);
          
          const data: ApiResponse = await response.json();
          
          if (!data?.items || !data?.meta) {
            throw ('Estructura de datos inválida');
          }
          
          allChars = [...allChars, ...data.items];
          totalPages = data.meta.totalPages;
          nextPage++;
        }
        
        setAllCharacters(allChars);
        setError(null);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Error al cargar personajes');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCharacters();
  }, []);

  useEffect(() => {
    if (allCharacters.length > 0) {
      const affiliations = [...new Set(allCharacters
        .map(char => char.affiliation)
        .filter((aff): aff is string => !!aff)
        .sort()
      )];
      setUniqueAffiliations(affiliations);
    }
  }, [allCharacters]);

  const parseKiValue = (kiString: string | number): number => {
    if (!kiString) return 0;
    
    if (typeof kiString === 'number') return kiString;
    
    const numericString = kiString.toString().replace(/\./g, '');
    
    if (kiString.includes('Septillion')) {
      const num = parseFloat(kiString);
      return num ;
    }
    
    return parseFloat(numericString) || 0;
  };

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter(char => {
      if (filters.affiliation && 
          !char.affiliation?.toLowerCase().includes(filters.affiliation.toLowerCase())) {
        return false;
      }
      
      const charKi = parseKiValue(char.ki);
      
      if (filters.minKi && charKi < parseKiValue(filters.minKi)) {
        return false;
      }
      
      if (filters.maxKi && charKi > parseKiValue(filters.maxKi)) {
        return false;
      }
      
      return true;
    });
  }, [allCharacters, filters]);

  const paginatedCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCharacters.slice(startIndex, startIndex + pageSize);
  }, [filteredCharacters, currentPage]);

  const totalFilteredPages = Math.ceil(filteredCharacters.length / pageSize);

  const resetFilters = () => {
    setFilters({
      affiliation: '',
      minKi: '',
      maxKi: ''
    });
    setCurrentPage(1);
  };

  if (error) return <Error message={error} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PERSONAJES DE DRAGON BALL Z</Text>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterGroup}>
          <Text>Facción:</Text>
          <Picker
            selectedValue={filters.affiliation}
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, affiliation: value }));
              setCurrentPage(1);
            }}
            style={styles.filterSelect}
          >
            <Picker.Item label="Todas" value="" />
            {uniqueAffiliations.map(aff => (
              <Picker.Item key={aff} label={aff || 'Desconocida'} value={aff} />
            ))}
          </Picker>
        </View>
        
        <View style={styles.filterGroup}>
          <Text>KI Mínimo:</Text>
          <TextInput
            value={filters.minKi}
            onChangeText={(value) => {
              setFilters(prev => ({ ...prev, minKi: value }));
              setCurrentPage(1);
            }}
            placeholder="Ej: 1.000.000"
            placeholderTextColor="#333"
            style={styles.filterInput}
          />
        </View>
        
        <View style={styles.filterGroup}>
          <Text>KI Máximo:</Text>
          <TextInput
            value={filters.maxKi}
            onChangeText={(value) => {
              setFilters(prev => ({ ...prev, maxKi: value }));
              setCurrentPage(1);
            }}
            placeholder="Ej: 90 "
            placeholderTextColor="#333"
            style={styles.filterInput}
          />
        </View>
        
        <TouchableOpacity 
          onPress={resetFilters}
          style={styles.resetButton}
        >
          <Text style={styles.buttonText}>Reiniciar Filtros</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingWrapper}>
          <Loading />
        </View>
      ) : (
        <>
          <View style={styles.resultsInfo}>
            <Text>Mostrando {paginatedCharacters.length} de {filteredCharacters.length} personajes</Text>
          </View>
          <ScrollView scrollEnabled={false}>
          <FlatList
            data={paginatedCharacters}
            renderItem={({ item }) => (
              <CharacterCard 
                key={`${item.id}-${item.name}`} 
                character={{
                  ...item,
                  ki: parseKiValue(item.ki),
                  maxKi: parseKiValue(item.maxKi)
                }}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.gridContainer}
          />
          </ScrollView>

          {filteredCharacters.length === 0 && !loading && (
            <View style={styles.noResults}>
              <Text>No se encontraron personajes con estos filtros</Text>
            </View>
          )}

          {totalFilteredPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={styles.paginationButton}
              >
                <Text>Anterior</Text>
              </TouchableOpacity>
              
              {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                let pageNum;
                if (totalFilteredPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalFilteredPages - 2) {
                  pageNum = totalFilteredPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                    <TouchableOpacity
                    key={pageNum}
                    onPress={() => setCurrentPage(pageNum)}
                    style={[
                      styles.paginationButton, // Base styles
                      currentPage === pageNum && { backgroundColor: '#007AFF' } // Estilos condicionales
                    ]}
                  >
                    <Text>{pageNum}</Text>
                  </TouchableOpacity>
                  
                );
              })}
              
              <TouchableOpacity
                onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalFilteredPages))}
                disabled={currentPage === totalFilteredPages}
                style={styles.paginationButton}
              >
                <Text>Siguiente</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
        marginHorizontal: 16,
        marginVertical: 18,
      },
      filterInput: {
        borderWidth: 1,
        borderColor: '#555',
        color: 'black',
        fontWeight: 'bold',
        padding: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: '#ffffff',
      },
      gridContainer: {
        padding: 16,
        marginHorizontal: 8,
      },
  title: {
    fontSize: 28,
    fontFamily: 'Saiyan-Sans',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FF6B00',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
    fontWeight: 'bold',
    borderColor: '#555',
  },
  filterContainer: {
    marginBottom: 16,
    color: 'black',
    fontWeight: 'bold',
    borderColor: '#555',
  },
  filterGroup: {
    marginBottom: 8,
    color: 'black',
    fontWeight: 'bold',
    borderColor: '#555',
    
  },
  filterSelect: {
    height: 50,
    width: '100%',
    color: 'black',
    fontWeight: 'bold',
    borderColor: '#555',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    borderColor: '#555',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  paginationButton: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  resultsInfo: {
    padding: 8,
    marginBottom: 8,    
    borderColor: '#555',
  },
});

export default Page;