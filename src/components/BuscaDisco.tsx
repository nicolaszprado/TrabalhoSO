import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface RequisicaoDisco {
  posicao: number;
  processada: boolean;
  ativa?: boolean;
}

export function BuscaDisco() {
  const [algoritmo, setAlgoritmo] = useState<'FCFS' | 'SCAN' | 'SSTF'>('FCFS');
  const [executando, setExecutando] = useState(false);
  const [posicaoCabeca, setPosicaoCabeca] = useState(50);
  const [direcao, setDirecao] = useState<'subindo' | 'descendo'>('subindo');
  const [requisicoes, setRequisicoes] = useState<RequisicaoDisco[]>([
    { posicao: 90, processada: false },
    { posicao: 30, processada: false },
    { posicao: 70, processada: false },
    { posicao: 20, processada: false },
    { posicao: 50, processada: false },
    { posicao: 85, processada: false },
  ]);

  const reiniciarSimulacao = () => {
    setPosicaoCabeca(50);
    setDirecao('subindo');
    setRequisicoes(requisicoes.map(r => ({ ...r, processada: false, ativa: false })));
    setExecutando(false);
  };

  const encontrarProximaSSTF = (posicaoAtual: number, requisicoes: RequisicaoDisco[]) => {
    const requisicoesNaoProcessadas = requisicoes.filter(r => !r.processada);
    if (requisicoesNaoProcessadas.length === 0) return null;

    return requisicoesNaoProcessadas.reduce((maisProxima, atual) => {
      const distanciaMaisProxima = Math.abs(posicaoAtual - maisProxima.posicao);
      const distanciaAtual = Math.abs(posicaoAtual - atual.posicao);
      return distanciaAtual < distanciaMaisProxima ? atual : maisProxima;
    });
  };

  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    if (executando) {
      intervalo = setInterval(() => {
        if (algoritmo === 'FCFS') {
          const proximaRequisicao = requisicoes.find(r => !r.processada);
          if (proximaRequisicao) {
            setPosicaoCabeca(proximaRequisicao.posicao);
            setRequisicoes(requisicoes.map(r => 
              r === proximaRequisicao 
                ? { ...r, processada: true, ativa: true } 
                : { ...r, ativa: false }
            ));
          } else {
            setExecutando(false);
          }
        } else if (algoritmo === 'SSTF') {
          const proximaRequisicao = encontrarProximaSSTF(posicaoCabeca, requisicoes);
          if (proximaRequisicao) {
            setPosicaoCabeca(proximaRequisicao.posicao);
            setRequisicoes(requisicoes.map(r => 
              r === proximaRequisicao 
                ? { ...r, processada: true, ativa: true } 
                : { ...r, ativa: false }
            ));
          } else {
            setExecutando(false);
          }
        } else { // SCAN
          setPosicaoCabeca(atual => {
            const passo = direcao === 'subindo' ? 5 : -5;
            const proxima = atual + passo;

            setRequisicoes(reqs => reqs.map(r => {
              const deveProcessar = Math.abs(r.posicao - proxima) < 5;
              return {
                ...r,
                processada: deveProcessar ? true : r.processada,
                ativa: deveProcessar
              };
            }));

            if (proxima >= 100) {
              setDirecao('descendo');
              return 95;
            } else if (proxima <= 0) {
              setDirecao('subindo');
              return 5;
            }

            return proxima;
          });

          if (requisicoes.every(r => r.processada)) {
            setExecutando(false);
          }
        }
      }, 500);
    }

    return () => clearInterval(intervalo);
  }, [executando, algoritmo, requisicoes, direcao, posicaoCabeca]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <select
          value={algoritmo}
          onChange={(e) => setAlgoritmo(e.target.value as 'FCFS' | 'SCAN' | 'SSTF')}
          className="rounded-md border-gray-300 shadow-sm px-4 py-2"
        >
          <option value="FCFS">FCFS (First Come, First Served)</option>
          <option value="SSTF">SSTF (Shortest Seek Time First)</option>
          <option value="SCAN">SCAN (Elevador)</option>
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

      <div className="relative h-96 bg-gray-100 rounded-lg p-4">
        {/* Trilha */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
          <div className="w-full h-2 bg-gray-400 rounded-full" />
          
          {/* Requisições */}
          {requisicoes.map((requisicao, indice) => (
            <div
              key={indice}
              className={`
                absolute top-1/2 -translate-y-1/2
                transition-all duration-300
                ${requisicao.processada 
                  ? 'bg-green-500' 
                  : requisicao.ativa 
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }
                ${requisicao.ativa ? 'scale-150' : 'scale-100'}
              `}
              style={{
                left: `${requisicao.posicao}%`,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                transform: `translate(-50%, -50%) scale(${requisicao.ativa ? 1.5 : 1})`,
              }}
            />
          ))}

          {/* Cabeça de leitura */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-12 bg-indigo-600 transition-all duration-500"
            style={{ 
              left: `${posicaoCabeca}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Fila de Requisições */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-col gap-2">
            {requisicoes.map((requisicao, indice) => (
              <div
                key={indice}
                className={`
                  h-12 rounded-lg border-2 flex items-center justify-center
                  transition-all duration-300
                  ${requisicao.processada 
                    ? 'border-green-500 bg-green-50' 
                    : requisicao.ativa
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-red-500 bg-red-50'
                  }
                  ${requisicao.ativa ? 'scale-105' : 'scale-100'}
                `}
              >
                <span className="text-lg font-bold">
                  Posição: {requisicao.posicao}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Status:</h3>
          <p>Posição atual: {posicaoCabeca}</p>
          {algoritmo === 'SCAN' && <p>Direção: {direcao === 'subindo' ? 'Subindo' : 'Descendo'}</p>}
          <p>Requisições processadas: {requisicoes.filter(r => r.processada).length}/{requisicoes.length}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Legenda:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-600" />
              <span>Cabeçote de leitura</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500" />
              <span>Requisição pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500" />
              <span>Requisição em processamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500" />
              <span>Requisição processada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}