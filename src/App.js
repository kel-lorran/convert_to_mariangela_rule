import React, { useState } from 'react';
import Doc from './model/Doc';
import Line from './model/Line';
import './App.css';

function App() {
  const [contentToConvert, setContentToConvert] = useState('');
  const [contentConverted, setContentConverted] = useState('');

  const handleChange = ({ target: {value}}) => setContentToConvert(value);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const doc = new Doc(contentToConvert)
      setContentConverted(doc.convert())
    } catch(error) {
      window.alert('Documento inserido não corresponde com a formatação de saída do Data Modeler esperada')
    }
  } 

  return (
    <div className="App">
      <h1>Convertar seus arquivos .ddl gerados automaticamente pelo Oracle Data Modeler para o padão Mariangela</h1>
      <form onSubmit={handleSubmit} onChange={handleChange}>
        <textarea placeholder="cole seu codigo aqui" required>
        </textarea>
        <button type="submit">Converter</button>
        {/* <textarea> */}
          <pre>
            {contentConverted}
          </pre>
        {/* </textarea> */}
      </form>
    </div>
  );
}

export default App;
