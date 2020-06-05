import React, {useState, useEffect} from 'react';
import Constants from 'expo-constants';
import {Feather as Icon} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {SvgUri} from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Item {
    id: number;
    titulo: string;
    url_imagem: string;
}

interface Ponto {
    id: number;
    nome: string;
    imagem: string;
    latitude: number;
    longitude: number;
    url_imagem: string;
}

interface Parametros{
    uf: string;
    cidade: string;
}

const Pontos = () => {
    const navegacao = useNavigation();
    const rota = useRoute();
    const rotaComParametros = rota.params as Parametros;
    const [itens, setItens] = useState<Item[]>([]);
    const [pontos, setPontos] = useState<Ponto[]>([]);
    const [itensSelecionados, setItensSelecionados] = useState<number[]>([]);
    const [posicaoInicial, setPosicaoInicial] = useState<[number, number]>([0, 0]);

    function voltarParaHome(){
        navegacao.navigate('Home');
    }

    function mostrarDetalhes(id: Number){
        navegacao.navigate('Detalhes', {id_ponto: id})
    }

    useEffect(() => {
        async function loadPosition(){
            const {status} = await Location.requestPermissionsAsync();

            if(status !== "granted"){
                Alert.alert('Oooops...', 'Precisamos da sua permissao para obter a localização');
                return;
            }

            const localizacao = await Location.getCurrentPositionAsync();

            const {latitude, longitude} = localizacao.coords;

            setPosicaoInicial([
                latitude,
                longitude
            ]);
        }

        loadPosition();
    },[])


    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data);
        });
    }, [])

    useEffect(() => {        
        api.get('ponto', {
            params: {
                uf: rotaComParametros.uf,
                cidade: rotaComParametros.cidade,
                itens: itensSelecionados
            }
        }).then(response => {
            setPontos(response.data);             
        })
        
    },[itensSelecionados])

    function obterItensSelecionados(id: number){
        const jaSelecionado = itensSelecionados.findIndex(item => item === id);

        if (jaSelecionado >= 0) {
            const itensFiltrados = itensSelecionados.filter(item => item !== id);

            setItensSelecionados(itensFiltrados);
        }else
            setItensSelecionados([...itensSelecionados, id]);
       
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={voltarParaHome}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {posicaoInicial[0] !== 0 && (
                        <MapView
                            style={styles.map}
                            loadingEnabled={posicaoInicial[0] === 0}
                            initialRegion={{
                                latitude: posicaoInicial[0],
                                longitude: posicaoInicial[1],
                                latitudeDelta: 0.010,
                                longitudeDelta: 0.010
                            }}
                        >
                            {pontos.map(ponto => (
                                <Marker
                                    key={String(ponto.id)}
                                    style={styles.mapMarker}
                                    onPress={() => mostrarDetalhes(ponto.id)}
                                    coordinate={{
                                        latitude:  ponto.latitude,
                                        longitude: ponto.longitude
                                    }}
                                >
                                    <View style={styles.mapMarkerContainer}>
                                        <Image 
                                            style={styles.mapMarkerImage}
                                            source={{uri: ponto.url_imagem}}
                                        />
                                        <Text style={styles.mapMarkerTitle}>{ponto.nome}</Text>
                                    </View>
                                </Marker>
                            ))}
                            
                        </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20
                    }}
                >
                    {itens.map(item => (
                        <TouchableOpacity
                            key={String(item.id)}
                            style={[
                                styles.item,
                                itensSelecionados.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            activeOpacity={0.5}
                            onPress={() => obterItensSelecionados(item.id)}
                        >
                            <SvgUri width={42} height={42} uri={item.url_imagem} />
                            <Text style={styles.itemTitle}>{item.titulo}</Text>
                        </TouchableOpacity>
                    ))}
                    
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Pontos;