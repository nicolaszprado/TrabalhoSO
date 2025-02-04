import React from 'react';

interface Aba {
  id: string;
  rotulo: string;
  icone: React.ReactNode;
}

interface AbasProps {
  abas: Aba[];
  abaAtiva: string;
  aoMudar: (abaId: string) => void;
}

export function Abas({ abas, abaAtiva, aoMudar }: AbasProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => aoMudar(aba.id)}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
              ${
                abaAtiva === aba.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {aba.icone}
            {aba.rotulo}
          </button>
        ))}
      </nav>
    </div>
  );
}