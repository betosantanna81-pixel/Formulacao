import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Download } from 'lucide-react';
import { InputCell, TextCell } from './components/InputCell';
import { ChemicalComponents, RawMaterialRow, ComponentKey } from './types';
import { COMPONENT_KEYS, INITIAL_ROWS, INITIAL_TARGETS } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [productName, setProductName] = useState<string>("");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  
  const [targets, setTargets] = useState<ChemicalComponents>(INITIAL_TARGETS);
  const [rows, setRows] = useState<RawMaterialRow[]>(INITIAL_ROWS);

  // --- Handlers ---

  const handleTargetChange = (key: ComponentKey, value: string) => {
    setTargets(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleRowChange = (id: string, field: keyof RawMaterialRow, value: string | number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      return { ...row, [field]: value };
    }));
  };

  const handleComponentChange = (id: string, key: ComponentKey, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      return {
        ...row,
        components: { ...row.components, [key]: parseFloat(value) || 0 }
      };
    }));
  };

  const addRow = () => {
    const newRow: RawMaterialRow = {
      id: Math.random().toString(36).substr(2, 9),
      materialName: '',
      supplier: '',
      percentage: 0,
      components: { B: 0, Cu: 0, Mn: 0, Zn: 0, Fe: 0, Mo: 0, S: 0 },
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  // --- Calculations ---

  // Calculate results dynamically
  const results = useMemo(() => {
    const calculated: ChemicalComponents = { B: 0, Cu: 0, Mn: 0, Zn: 0, Fe: 0, Mo: 0, S: 0 };
    
    // Safety check to avoid division by zero
    const safeTotalQty = totalQuantity === 0 ? 1 : totalQuantity;

    COMPONENT_KEYS.forEach(key => {
      let sum = 0;
      rows.forEach(row => {
        const rowQty = totalQuantity * (row.percentage / 100);
        const contribution = (rowQty * row.components[key]); 
        sum += contribution;
      });
      calculated[key] = sum / safeTotalQty;
    });

    return calculated;
  }, [rows, totalQuantity]);

  const totalPercentage = useMemo(() => {
    return rows.reduce((acc, row) => acc + row.percentage, 0);
  }, [rows]);

  const totalCalculatedQuantity = useMemo(() => {
     return rows.reduce((acc, row) => acc + (totalQuantity * (row.percentage / 100)), 0);
  }, [rows, totalQuantity]);


  // --- Helper Formatters ---
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100 flex flex-col gap-6">
      
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-[-0.5rem]">Formulação de Micros</h1>

      {/* Header Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <div className="flex items-center">
            <span className="bg-blue-800 text-white px-4 py-2 font-bold rounded-l-md w-32 text-center shadow-sm">Produto</span>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="border-y-2 border-r-2 border-blue-800 px-4 py-2 font-semibold text-lg rounded-r-md outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64 bg-white text-gray-900 shadow-sm"
              placeholder="Nome do Produto"
            />
          </div>
          <div className="flex items-center">
            <span className="bg-blue-600 text-white px-4 py-2 font-bold rounded-l-md w-32 text-center shadow-sm">Quantidade</span>
            <div className="relative w-full md:w-48">
              <input 
                type="number" 
                value={totalQuantity === 0 ? '' : totalQuantity}
                onChange={(e) => setTotalQuantity(parseFloat(e.target.value) || 0)}
                className="border-y-2 border-r-2 border-blue-600 px-4 py-2 font-semibold text-lg rounded-r-md outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white text-gray-900 text-right pr-8 shadow-sm"
                placeholder="0"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold pointer-events-none">Kg</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 italic mt-2 ml-1">
          Insira o nome do produto e a quantidade total do lote para iniciar os cálculos.
        </p>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto rounded-lg shadow bg-white border border-gray-300">
        <table className="min-w-full border-collapse text-sm">
            <colgroup>
                <col className="w-64" /> {/* Name */}
                <col className="w-48" /> {/* Supplier */}
                <col className="w-24" /> {/* Percent */}
                <col className="w-32" /> {/* Calc Qty */}
                {COMPONENT_KEYS.map(k => <col key={k} className="w-20" />)}
                <col className="w-10" /> {/* Actions */}
            </colgroup>
            
            <thead>
                <tr className="bg-blue-700 text-white">
                    <th colSpan={4} className="px-3 py-2 text-left font-bold border-r border-blue-600 text-lg">Garantias</th>
                    {COMPONENT_KEYS.map(key => (
                        <th key={key} className="px-2 py-2 text-center border-r border-blue-600">{key}</th>
                    ))}
                    <th className="bg-white border-none"></th>
                </tr>
            </thead>
            <tbody>
                {/* Targets - Editable */}
                <tr className="bg-blue-50">
                    <td colSpan={4} className="px-3 py-2 font-bold text-blue-900 border-r border-blue-200">Teor (Meta)</td>
                    {COMPONENT_KEYS.map(key => (
                        <td key={key} className="border-r border-blue-200 p-0 h-10 border-b border-blue-200">
                             <InputCell 
                                value={targets[key] === 0 ? '' : targets[key]} 
                                onValueChange={(val) => handleTargetChange(key, val)}
                                className="bg-white text-blue-900 font-bold text-center"
                                placeholder="0"
                            />
                        </td>
                    ))}
                    <td className="bg-white border-none"></td>
                </tr>

                 {/* Results - Read Only (Light Green BG) */}
                 <tr className="bg-green-100 border-b border-green-200">
                    <td colSpan={4} className="px-3 py-2 font-bold text-gray-800 border-r border-green-200">Resultado Calculado</td>
                    {COMPONENT_KEYS.map(key => (
                        <td key={key} className="border-r border-green-200 text-center px-2 py-2 font-bold text-gray-900 border-b border-green-200 bg-green-100">
                            {formatNumber(results[key])}%
                        </td>
                    ))}
                    <td className="bg-white border-none"></td>
                </tr>

                {/* Data Headers */}
                <tr className="bg-gray-300 text-gray-800 font-bold text-xs uppercase tracking-wider">
                    <th className="px-3 py-2 text-left border-r border-gray-400">Matéria Prima</th>
                    <th className="px-3 py-2 text-left border-r border-gray-400">Fornecedor</th>
                    <th className="px-3 py-2 text-center border-r border-gray-400">% (do total)</th>
                    <th className="px-3 py-2 text-right border-r border-gray-400">Quantidade (Kg)</th>
                    {COMPONENT_KEYS.map(key => (
                        <th key={key} className="px-2 py-2 text-center border-r border-gray-400">{key}</th>
                    ))}
                    <th className="bg-white border-none"></th>
                </tr>

                {/* Data Rows */}
                {rows.map((row, index) => {
                    const rowQty = totalQuantity * (row.percentage / 100);
                    return (
                        <tr key={row.id} className="border-b border-gray-200 hover:bg-yellow-50 transition-colors">
                            {/* Name - Editable */}
                            <td className="p-0 border-r border-gray-200 h-9">
                                <TextCell 
                                    value={row.materialName} 
                                    onValueChange={(v) => handleRowChange(row.id, 'materialName', v)}
                                    placeholder=""
                                    className="px-3 text-gray-800 font-medium bg-white"
                                />
                            </td>
                            {/* Supplier - Editable */}
                            <td className="p-0 border-r border-gray-200 h-9">
                                <TextCell 
                                    value={row.supplier} 
                                    onValueChange={(v) => handleRowChange(row.id, 'supplier', v)}
                                    placeholder=""
                                    className="px-3 text-gray-700 bg-white"
                                />
                            </td>
                            {/* Percentage - Editable */}
                            <td className="p-0 border-r border-gray-200 h-9">
                                <InputCell 
                                    value={row.percentage === 0 ? '' : row.percentage}
                                    onValueChange={(v) => handleRowChange(row.id, 'percentage', parseFloat(v) || 0)}
                                    className="text-center font-bold text-gray-800 bg-white"
                                    placeholder="0"
                                />
                            </td>
                            {/* Quantity (Kg) - Calculated / Read Only (Darker BG) */}
                            <td className="px-3 text-right font-mono text-gray-900 font-bold border-r border-gray-200 bg-gray-200 flex items-center justify-end h-9">
                                {formatNumber(rowQty, 2)}
                            </td>
                            {/* Components - Editable */}
                             {COMPONENT_KEYS.map(key => (
                                <td key={key} className="p-0 border-r border-gray-200 h-9">
                                     <InputCell 
                                        value={row.components[key] === 0 ? '' : row.components[key]}
                                        onValueChange={(v) => handleComponentChange(row.id, key, v)}
                                        className="text-center text-gray-600 bg-white"
                                        placeholder=""
                                    />
                                </td>
                            ))}
                            <td className="text-center bg-white border-none align-middle">
                                <button 
                                    onClick={() => removeRow(row.id)}
                                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                    title="Remover linha"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    );
                })}

                {/* Totals Footer for Grid - Read Only (Darker BG) */}
                 <tr className="bg-gray-200 font-bold border-t-2 border-gray-300">
                    <td className="px-3 py-2 text-gray-700 uppercase text-xs tracking-wider">TOTAIS</td>
                    <td className="border-r border-gray-300"></td>
                    <td className={`px-2 py-2 text-center border-r border-gray-300 ${Math.abs(totalPercentage - 100) > 0.1 ? 'text-red-600' : 'text-green-800'}`}>
                        {formatNumber(totalPercentage)}%
                    </td>
                    <td className="px-3 py-2 text-center border-r border-gray-300 font-mono text-black">
                        {formatNumber(totalCalculatedQuantity, 2)}
                    </td>
                    {COMPONENT_KEYS.map(k => <td key={k} className="border-r border-gray-300 bg-gray-200"></td>)}
                    <td className="bg-white border-none"></td>
                </tr>
            </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-2">
        <button 
            onClick={addRow}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
        >
            <Plus size={18} />
            Adicionar Matéria Prima
        </button>

        <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded shadow transition-colors" onClick={() => alert("Funcionalidade de salvar seria implementada aqui.")}>
                <Save size={18} /> Salvar
            </button>
             <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors" onClick={() => window.print()}>
                <Download size={18} /> Imprimir/PDF
            </button>
        </div>
      </div>
      
      {Math.abs(totalPercentage - 100) > 0.1 && totalPercentage > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <p className="text-red-700 font-medium">Atenção: A soma das porcentagens não é 100% ({formatNumber(totalPercentage)}%). Ajuste as quantidades.</p>
          </div>
      )}

    </div>
  );
};

export default App;