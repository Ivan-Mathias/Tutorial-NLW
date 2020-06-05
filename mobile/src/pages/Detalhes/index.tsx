import React, {useEffect, useState} from 'react';
import {Feather as Icon, FontAwesome} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, StyleSheet, Text, Image, TouchableOpacity, SafeAreaView, Linking} from 'react-native';
import Constants from 'expo-constants';
import {RectButton} from 'react-native-gesture-handler';
import api from '../../services/api';
import * as CriarEmail from 'expo-mail-composer';

interface Parametros{
    id_ponto: number;
}

interface Dados{
    ponto: {
        imagem: string;
        nome: string;
        email: string;
        whatsapp: string;
        uf: string;
        cidade: string;
    }
    itens: {
        titulo: string;
    }[];
}

const Detalhes = () => {
    const navegacao = useNavigation();
    const rota = useRoute();
    const rotaComParametros = rota.params as Parametros;
    const [dados, setDados] = useState<Dados>({} as Dados); 

    useEffect(() => {
        api.get(`ponto/${rotaComParametros.id_ponto}`).then(resposta => {
            setDados(resposta.data);
        });
        
    }, []);

    function voltarParaHome(){
        navegacao.navigate('Pontos');
    }

    function mandarEmail(){
        CriarEmail.composeAsync({
            subject: 'Interesse na coleta de resíduos',
            recipients: [dados.ponto.email],
        });
    }

    function mandarWhatsapp(){
        Linking.openURL(`whatsapp://send?phone=${dados.ponto.whatsapp}&text=Quero jogar meu lixo na sua calçada.`);
    }

    if(!dados.ponto) return null;
    
    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={voltarParaHome}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Image 
                    style={styles.pointImage}
                    source={{uri:dados.ponto.imagem}}
                />

                <Text style={styles.pointName}>{dados.ponto.nome}</Text>
                <Text style={styles.pointItems}>
                    {dados.itens.map(item => item.titulo).join(', ')}
                </Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>
                        {dados.ponto.cidade}, {dados.ponto.uf}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <RectButton 
                    style={styles.button}
                    onPress={mandarWhatsapp}
                >
                    <FontAwesome name="whatsapp" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>
                <RectButton 
                    style={styles.button}
                    onPress={mandarEmail}
                >
                    <Icon name="mail" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    pointImage: {
      width: '100%',
      height: 120,
      resizeMode: 'cover',
      borderRadius: 10,
      marginTop: 32,
    },
  
    pointName: {
      color: '#322153',
      fontSize: 28,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    pointItems: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    address: {
      marginTop: 32,
    },
    
    addressTitle: {
      color: '#322153',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },
  
    addressContent: {
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: '#999',
      paddingVertical: 20,
      paddingHorizontal: 32,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    
    button: {
      width: '48%',
      backgroundColor: '#34CB79',
      borderRadius: 10,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      marginLeft: 8,
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Roboto_500Medium',
    },
  });

export default Detalhes;