import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    titulo: string;
    url_imagem: string;
}

interface DadosUFIBGE {
    sigla: string;
}

interface DadosCidadesIBGE {
    nome: string;
}

const CriarPonto = () => {
    const [itens, setItens] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);
    
    const [localInicial, setLocalInicial] = useState<[number, number]>([0, 0]);

    const [dadosForm, setDadosForm] = useState({
        nome: '',
        email: '',
        whatsapp: '',
    });

    const [ufSelecionada, setUfSelecionada] = useState('0');
    const [cidadeSelecionada, setCidadeSelecionada] = useState('0');
    const [localSelecionado, setLocalSelecionado] = useState<[number, number]>([0, 0]);
    const [itensSelecionados, setItensSelecionados] = useState<number[]>([]);
    const [arquivoSelecionado, setArquivoSelecionado] = useState<File>();
    
    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(posicao => {
            const {latitude, longitude} = posicao.coords;

            setLocalInicial([latitude, longitude]);
        })
    }, []);

    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data);
        })
    }, []);
    
    useEffect(() => {
        axios.get<DadosUFIBGE[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
            const siglasUF = response.data.map(uf => uf.sigla);
            
            setUfs(siglasUF);            
        })
    }, []);

    useEffect(() => {
        if (ufSelecionada === '0') {
            return;
        }

        axios.get<DadosCidadesIBGE[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelecionada}/municipios?orderBy=nome`).then(response => {
            const nomeCidade = response.data.map(cidade => cidade.nome);
            
            setCidades(nomeCidade);            
        })
    }, [ufSelecionada]);

    function mudarUfSelecionada(evento: ChangeEvent<HTMLSelectElement>){
        const uf = evento.target.value;

        setUfSelecionada(uf);
    }

    function mudarCidadeSelecionada(evento: ChangeEvent<HTMLSelectElement>){
        const cidade = evento.target.value;

        setCidadeSelecionada(cidade);
    }

    function obterPontoNoMapa(evento: LeafletMouseEvent){
        setLocalSelecionado([
            evento.latlng.lat,
            evento.latlng.lng,
        ]);
    }

    function obterItensSelecionados(id: number){
        const jaSelecionado = itensSelecionados.findIndex(item => item === id);

        if (jaSelecionado >= 0) {
            const itensFiltrados = itensSelecionados.filter(item => item !== id);

            setItensSelecionados(itensFiltrados);
        }else
            setItensSelecionados([...itensSelecionados, id]);
        
    }

    function obterDados(evento: ChangeEvent<HTMLInputElement>){
        const {name, value} = evento.target;
        setDadosForm({...dadosForm, [name]: value})
        
    }

    async function enviarDados(evento: FormEvent){
        evento.preventDefault();        

        const {nome, email, whatsapp} = dadosForm;
        const uf = ufSelecionada;
        const cidade = cidadeSelecionada;
        const [latitude, longitude] = localSelecionado;
        const itens = itensSelecionados;

        const dados = new FormData();

        dados.append('nome', nome);
        dados.append('email', email);
        dados.append('whatsapp', whatsapp);
        dados.append('latitude', String(latitude));
        dados.append('longitude', String(longitude));
        dados.append('uf', uf);
        dados.append('cidade', cidade);
        dados.append('itens', itens.join(','));
        if (arquivoSelecionado) {
            dados.append('imagem', arquivoSelecionado);
        }
        
        try {
            await api.post('ponto', dados);

            alert('Ponto de coleta criado!');
        } catch (error) {
            alert('Erro ao mandar os dados!');
        }
        
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={enviarDados}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="nome"
                            id="name"
                            onChange={obterDados}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={obterDados}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={obterDados}
                            />
                        </div>
                    </div>
                </fieldset>

                <Dropzone arquivoNovo={setArquivoSelecionado} />

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={localInicial} zoom={15} onclick={obterPontoNoMapa}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={localSelecionado} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={ufSelecionada}
                                onChange={mudarUfSelecionada}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select
                                name="cidade"
                                id="cidade"
                                value={cidadeSelecionada}
                                onChange={mudarCidadeSelecionada}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cidades.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {itens.map(item => (
                            <li
                                key={item.id}
                                onClick={() => obterItensSelecionados(item.id)}
                                className={itensSelecionados.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.url_imagem} alt={item.titulo}/>
                                <span>{item.titulo}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
}

export default CriarPonto;