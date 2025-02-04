import React, { useState } from 'react';
import { Abas } from './components/Abas';
import { SubstituicaoPaginas } from './components/SubstituicaoPaginas';
import { BuscaDisco } from './components/BuscaDisco';
import { HardDrive, Layers } from 'lucide-react';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('paginas');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">
            Simulador de Algoritmos de Gerenciamento de Memória
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Abas
          abas={[
            {
              id: 'paginas',
              rotulo: 'Substituição de Páginas',
              icone: <Layers className="w-5 h-5" />
            },
            {
              id: 'disco',
              rotulo: 'Busca em Disco',
              icone: <HardDrive className="w-5 h-5" />
            }
          ]}
          abaAtiva={abaAtiva}
          aoMudar={setAbaAtiva}
        />

        <div className="mt-8">
          {abaAtiva === 'paginas' ? <SubstituicaoPaginas /> : <BuscaDisco />}
        </div>
      </main>
    </div>
  );
}

export default App;