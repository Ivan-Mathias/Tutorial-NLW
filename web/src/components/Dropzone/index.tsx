import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {FiUpload} from 'react-icons/fi';

import './styles.css';

interface Props {
    arquivoNovo: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({arquivoNovo}) => {
    const [urlArquivoSelecionado, setUrlArquivoSelecionado] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const arquivo = acceptedFiles[0];

        const urlArquivo = URL.createObjectURL(arquivo);

        setUrlArquivoSelecionado(urlArquivo);
        arquivoNovo(arquivo);
    }, [arquivoNovo])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: 'image/*'
        })

    return (
        <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} accept="image/*" />
        {
            urlArquivoSelecionado
            ? <img src={urlArquivoSelecionado} alt="" />
            : (
                isDragActive 
                    ? <p><FiUpload /> Solte a imagem aqui</p>
                    : <p><FiUpload /> Arraste ou clique aqui para adicionar a imagem do estabelecimento</p>
            )
        }
        
        </div>
    )
}

export default Dropzone;