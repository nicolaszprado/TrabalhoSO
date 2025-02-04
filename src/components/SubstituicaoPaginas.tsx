import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, ArrowDownToLine } from 'lucide-react';

interface Pagina {
  id: number;
  timestamp: number;
  nova?: boolean;
  ordem: number;
}

export function SubstituicaoPaginas() {
  const [algoritmo, setAlgoritmo] = useState<'LRU' | 'FIFO'>('LRU');
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [quadros] = useState(4);
  const [executando, setExecutando] = useState(false);
  const [sequenciaPaginas] = useState([1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [proximaSubstituicao, setProximaSubstituicao] = useState<number | null>(null);

  const reiniciarSimulacao = () => {
    setPaginas([]);
    setIndiceAtual(0);
    setExecutando(false);
    setProximaSubstituicao(null);
  };

  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    if (executando && indiceAtual < sequenciaPaginas.length) {
      intervalo = setInterval(() => {
        const novaPagina = sequenciaPaginas[indiceAtual];
        
        setPaginas(paginasAtuais => {
          const paginasAtualizadas = paginasAtuais.map(p => ({ ...p, nova: false }));
          
          if (paginasAtualizadas.some(p => p.id === novaPagina)) {
            return paginasAtualizadas.map(p => 
              p.id === novaPagina 
                ? { ...p, timestamp: Date.now(), nova: true } 
                : p
            );
          }

          if (paginasAtualizadas.length < quadros) {
            return [...paginasAtualizadas, { 
              id: novaPagina, 
              timestamp: Date.now(), 
              nova: true, 
              ordem: paginasAtualizadas.length 
            }];
          }

          if (algoritmo === 'LRU') {
            const paginaMaisAntiga = paginasAtualizadas.reduce((min, p) => 
              p.timestamp < min.timestamp ? p : min
            );
            setProximaSubstituicao(paginaMaisAntiga.ordem);
            return paginasAtualizadas.map(p => 
              p === paginaMaisAntiga 
                ? { id: novaPagina, timestamp: Date.now(), nova: true, ordem: p.ordem } 
                : p
            );
          } else { // FIFO
            setProximaSubstituicao(0);
            const novasPaginas = [...paginasAtualizadas.slice(1), { 
              id: novaPagina, 
              timestamp: Date.now(), 
              nova: true, 
              ordem: quadros - 1 
            }];
            return novasPaginas.map((p, idx) => ({ ...p, ordem: idx }));
          }
        });

        setIndiceAtual(i => i + 1);
      }, 1000);
    }

    return () => clearInterval(intervalo);
  }, [executando, indiceAtual, algoritmo, quadros, sequenciaPaginas]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <select
          value={algoritmo}
          onChange={(e) => setAlgoritmo(e.target.value as 'LRU' | 'FIFO')}
          className="rounded-md border-gray-300 shadow-sm px-4 py-2"
        >
          <option value="LRU">LRU (Least Recently Used)</option>
          <option value="FIFO">FIFO (First In, First Out)</option>
        </select>

        <button
          onClick={() => setExecutando(!executando)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {executando ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {executando ? 'Pausar' : 'Iniciar'}
        </button>

        <button
          onClick={reiniciarSimulacao}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="relative h-96 bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Memória Principal
          </h3>
          <div className="absolute bottom-4 left-4 right-4">
            {paginas.map((pagina) => (
              <div
                key={`${pagina.id}-${pagina.timestamp}`}
                className={`
                  absolute left-0 right-0 h-20 rounded-lg border-2 flex items-center justify-between px-6
                  transition-all duration-500 transform
                  ${pagina.nova ? 'scale-105' : 'scale-100'}
                  ${proximaSubstituicao === pagina.ordem ? 'border-red-500 bg-red-50' :
                    pagina.nova ? 'border-green-500 bg-green-50' : 'border-indigo-500 bg-indigo-50'}
                `}
                style={{
                  bottom: `${pagina.ordem * 84}px`,
                  transitionDelay: `${pagina.ordem * 100}ms`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-indigo-600">
                    {pagina.id}
                  </span>
                  {algoritmo === 'FIFO' && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ArrowDownToLine className="w-4 h-4" />
                      Ordem: {pagina.ordem + 1}
                    </div>
                  )}
                </div>
                {algoritmo === 'LRU' && (
                  <div className="text-sm text-gray-500">
                    Último acesso: {new Date(pagina.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Sequência de Páginas:</h3>
            <div className="flex flex-wrap gap-2">
              {sequenciaPaginas.map((pagina, indice) => (
                <span
                  key={indice}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full
                    ${indice === indiceAtual ? 'bg-indigo-600 text-white' : 'bg-gray-200'}
                    ${indice < indiceAtual ? 'bg-green-200' : ''}
                  `}
                >
                  {pagina}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Como funciona:</h3>
            <div className="space-y-2 text-sm">
              <p><strong>LRU (Least Recently Used):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Substitui a página que não é usada há mais tempo</li>
                <li>Rastreia o último acesso de cada página</li>
                <li>Página em vermelho será substituída</li>
              </ul>
              <p><strong>FIFO (First In, First Out):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Substitui a página mais antiga na memória</li>
                <li>Mantém ordem de chegada das páginas</li>
                <li>Primeira página (mais antiga) será substituída</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}