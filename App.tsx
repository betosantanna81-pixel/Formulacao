import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Download, X, HelpCircle, RotateCcw } from 'lucide-react';
import { InputCell, TextCell } from './components/InputCell';
import { ChemicalComponents, RawMaterialRow, ComponentKey } from './types';
import { COMPONENT_KEYS, INITIAL_ROWS, INITIAL_TARGETS } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [productName, setProductName] = useState<string>("");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  
  const [targets, setTargets] = useState<ChemicalComponents>({ ...INITIAL_TARGETS });
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

  const handleNewFormulation = () => {
    // Reset state immediately without confirmation dialog
    setProductName("");
    setTotalQuantity(0);
    setTargets({ ...INITIAL_TARGETS });
    setRows([{
        id: Math.random().toString(36).substr(2, 9),
        materialName: '',
        supplier: '',
        percentage: 0,
        components: { B: 0, Cu: 0, Mn: 0, Zn: 0, Fe: 0, Mo: 0, S: 0 },
    }]);
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

  // --- Save to Excel (XLS HTML) ---
  const handleSave = () => {
    // We construct an HTML string that resembles the table, with inline styles for colors/formatting.
    // Saving this as .xls allows Excel to open it with formatting preserved.
    
    const styles = `
      body { font-family: Arial, sans-serif; font-size: 12px; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border: 1px solid #9ca3af; padding: 5px; text-align: center; vertical-align: middle; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }
      .bg-blue { background-color: #1d4ed8; color: white; font-weight: bold; font-size: 14px; }
      .bg-light-blue { background-color: #eff6ff; color: #1e3a8a; font-weight: bold; }
      .bg-green { background-color: #dcfce7; font-weight: bold; }
      .bg-grey-header { background-color: #d1d5db; font-weight: bold; color: #1f2937; }
      .bg-grey-row { background-color: #e5e7eb; font-weight: bold; }
      .bg-dark-grey { background-color: #e5e7eb; font-weight: bold; }
      .header-product { background-color: #1e40af; color: white; font-weight: bold; text-align: center; }
      .header-qty { background-color: #2563eb; color: white; font-weight: bold; text-align: center; }
      .title { font-size: 24px; font-weight: bold; color: #14532d; text-align: center; margin-bottom: 20px; }
      .warning-red { color: #dc2626; font-weight: bold; }
      .ok-green { color: #166534; font-weight: bold; }
    `;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Formula</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>${styles}</style>
      </head>
      <body>
        <div class="title">FORMULAÇÃO DE MICROS</div>
        <div style="font-size: 10px; color: #9ca3af; text-align: right; margin-bottom: 10px;">Desenvolvido por "Beto Santanna"</div>
        
        <table border="0" style="border: none; margin-bottom: 20px;">
          <tr>
            <td class="header-product" style="width: 150px;">Produto</td>
            <td class="text-left" style="width: 300px; font-weight: bold; font-size: 14px;">${productName}</td>
            <td style="border:none; width: 20px;"></td>
            <td class="header-qty" style="width: 150px;">Quantidade</td>
            <td class="text-right" style="width: 150px; font-weight: bold; font-size: 14px;">${formatNumber(totalQuantity)} Kg</td>
          </tr>
          <tr>
            <td colspan="5" style="border:none; font-style: italic; color: #6b7280; font-size: 11px;">
              Insira o nome do produto e a quantidade total do lote para iniciar os cálculos.
            </td>
          </tr>
        </table>

        <table>
          <!-- Header -->
          <tr class="bg-blue">
            <td colspan="4" class="text-left">Garantias</td>
            ${COMPONENT_KEYS.map(k => `<td>${k}</td>`).join('')}
          </tr>
          
          <!-- Targets -->
          <tr class="bg-light-blue">
            <td colspan="4" class="text-left">TEOR (META)</td>
            ${COMPONENT_KEYS.map(k => `<td>${formatNumber(targets[k])}%</td>`).join('')}
          </tr>

          <!-- Results -->
          <tr class="bg-green">
            <td colspan="4" class="text-left">Resultado Calculado</td>
            ${COMPONENT_KEYS.map(k => `<td>${formatNumber(results[k])}%</td>`).join('')}
          </tr>

          <!-- Columns -->
          <tr class="bg-grey-header">
            <td class="text-left">MATÉRIA PRIMA</td>
            <td class="text-left">FORNECEDOR</td>
            <td>% (DO TOTAL)</td>
            <td>QUANTIDADE (KG)</td>
            ${COMPONENT_KEYS.map(k => `<td>${k}</td>`).join('')}
          </tr>

          <!-- Rows -->
          ${rows.map(row => {
            const rowQty = totalQuantity * (row.percentage / 100);
            return `
              <tr>
                <td class="text-left">${row.materialName}</td>
                <td class="text-left">${row.supplier}</td>
                <td>${formatNumber(row.percentage)}</td>
                <td class="bg-grey-row">${formatNumber(rowQty)}</td>
                ${COMPONENT_KEYS.map(k => `<td>${row.components[k] ? formatNumber(row.components[k]) : ''}</td>`).join('')}
              </tr>
            `;
          }).join('')}

          <!-- Totals -->
          <tr class="bg-dark-grey">
            <td colspan="2" class="text-right">TOTAIS</td>
            <td class="${Math.abs(totalPercentage - 100) > 0.1 ? 'warning-red' : 'ok-green'}">${formatNumber(totalPercentage)}%</td>
            <td>${formatNumber(totalCalculatedQuantity)}</td>
            ${COMPONENT_KEYS.map(k => `<td></td>`).join('')}
          </tr>

        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.trim() || 'formulacao'}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const element = document.getElementById('printable-content');
    if (!element) return;

    // Use html2pdf if available via CDN
    // @ts-ignore
    if (typeof window !== 'undefined' && window.html2pdf) {
      const opt = {
        margin: [5, 5, 5, 5], // 5mm margin
        filename: `${productName.trim() || 'formulacao'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: '#fefce8' // ensure yellow-50 background matches screen
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    } else {
      // Fallback for when library didn't load
      window.print();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-yellow-50 flex flex-col gap-6">
      
      <div id="printable-content" className="flex flex-col gap-6 bg-yellow-50 p-2">
        <div className="relative w-full mb-2">
          {/* Updated Title: Dark Moss Green (green-900), No Underline */}
          <h1 className="text-3xl text-center text-green-900 uppercase font-bold">Formulação de Micros</h1>
          <div className="absolute right-0 top-0 mt-2 text-xs text-gray-400 font-medium select-none opacity-70">
              Desenvolvido por "Beto Santanna"
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <div className="flex items-center shadow-sm">
              <span className="bg-blue-800 text-white px-4 py-2 font-bold w-32 text-center border border-blue-800">Produto</span>
              <input 
                type="text" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="border border-blue-800 border-l-0 px-4 py-2 font-semibold text-lg outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64 bg-white text-gray-900"
                placeholder="Nome do Produto"
              />
            </div>
            <div className="flex items-center shadow-sm">
              <span className="bg-blue-600 text-white px-4 py-2 font-bold w-32 text-center border border-blue-600">Quantidade</span>
              <div className="relative w-full md:w-48">
                <input 
                  type="number" 
                  value={totalQuantity === 0 ? '' : totalQuantity}
                  onChange={(e) => setTotalQuantity(parseFloat(e.target.value) || 0)}
                  className="border border-blue-600 border-l-0 px-4 py-2 font-semibold text-lg outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white text-gray-900 text-right pr-8 h-full"
                  placeholder=""
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
                      <td colSpan={4} className="px-3 py-2 font-bold text-blue-900 border-r border-blue-200 uppercase">TEOR (META)</td>
                      {COMPONENT_KEYS.map(key => (
                          <td key={key} className="border-r border-blue-200 p-0 h-10 border-b border-blue-200">
                               <InputCell 
                                  value={targets[key] === 0 ? '' : targets[key]}
                                  onValueChange={(val) => handleTargetChange(key, val)}
                                  className="bg-white text-blue-900 font-bold text-center"
                                  placeholder=""
                                  isDecimal={true}
                                  suffix="%"
                              />
                          </td>
                      ))}
                      <td className="bg-white border-none"></td>
                  </tr>

                   {/* Results - Read Only (Light Green BG) */}
                   <tr className="bg-green-100 border-b border-green-200">
                      <td colSpan={4} className="px-3 py-2 font-bold text-gray-800 border-r border-green-200 uppercase">Resultado Calculado</td>
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
                      <th className="px-3 py-2 text-center border-r border-gray-400">Quantidade (Kg)</th>
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
                                      placeholder="inserir"
                                      className="px-3 text-gray-800 font-medium bg-white"
                                  />
                              </td>
                              {/* Supplier - Editable */}
                              <td className="p-0 border-r border-gray-200 h-9">
                                  <TextCell 
                                      value={row.supplier} 
                                      onValueChange={(v) => handleRowChange(row.id, 'supplier', v)}
                                      placeholder="inserir"
                                      className="px-3 text-gray-700 bg-white"
                                  />
                              </td>
                              {/* Percentage - Editable */}
                              <td className="p-0 border-r border-gray-200 h-9">
                                  <InputCell 
                                      value={row.percentage === 0 ? '' : row.percentage}
                                      onValueChange={(v) => handleRowChange(row.id, 'percentage', parseFloat(v) || 0)}
                                      className="text-center font-bold text-gray-800 bg-white"
                                      placeholder=""
                                      isDecimal={true}
                                  />
                              </td>
                              {/* Quantity (Kg) - Calculated / Read Only (Darker BG) - CENTERED */}
                              <td className="px-3 text-center font-mono text-gray-900 font-bold border-r border-gray-200 bg-gray-200 flex items-center justify-center h-9">
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
                              <td className="text-center bg-white border-none align-middle" data-html2canvas-ignore="true">
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
                      <td className="border-r border-gray-300"></td>
                      {/* TOTAIS label moved to Supplier column, Right Aligned */}
                      <td className="px-3 py-2 text-gray-700 uppercase text-xs tracking-wider text-right border-r border-gray-300">TOTAIS</td>
                      <td className={`px-2 py-2 text-center border-r border-gray-300 ${Math.abs(totalPercentage - 100) > 0.1 ? 'text-red-600' : 'text-green-800'}`}>
                          {formatNumber(totalPercentage)}%
                      </td>
                      {/* Centered Total Quantity */}
                      <td className="px-3 py-2 text-center border-r border-gray-300 font-mono text-black">
                          {formatNumber(totalCalculatedQuantity, 2)}
                      </td>
                      {COMPONENT_KEYS.map(k => <td key={k} className="border-r border-gray-300 bg-gray-200"></td>)}
                      <td className="bg-white border-none"></td>
                  </tr>
              </tbody>
          </table>
        </div>

        {Math.abs(totalPercentage - 100) > 0.1 && totalPercentage > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
              <p className="text-red-700 font-medium">Atenção: A soma das porcentagens não é 100% ({formatNumber(totalPercentage)}%). Ajuste as quantidades.</p>
            </div>
        )}
      </div>

      <div className="flex justify-between items-start mt-2">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button 
                onClick={addRow}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
            >
                <Plus size={18} />
                Adicionar Matéria Prima
            </button>
            <button 
                onClick={handleNewFormulation}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded shadow transition-colors"
            >
                <RotateCcw size={18} />
                Nova Formulação
            </button>
          </div>
          
          <button 
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium text-sm px-2 py-1 hover:bg-blue-50 rounded transition-colors w-fit"
          >
             <HelpCircle size={16} />
             Instruções de Uso
          </button>
        </div>

        <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded shadow transition-colors" onClick={handleSave}>
                <Save size={18} /> Salvar
            </button>
             <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors" onClick={handlePrint}>
                <Download size={18} /> Imprimir/PDF
            </button>
        </div>
      </div>
      
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="text-blue-600" />
              Instruções de Uso
            </h2>
            
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              <li>Preencher o Nome do Produto a ser Formulado</li>
              <li>Preencher a Quantidade total desejada</li>
              <li>Na Linha de Teor (Meta) preencher as % desejadas do Produto Final</li>
              <li>Inserir a Primeira Materia Prima, os teores de cada elemento na linha e por fim a % dessa materia prima na formulação até que seja alcançado o Teor (meta) do elemento desejado.</li>
              <li>Adicionar Novas Materias Primas ou Apagar Linhas com Materias Primas Indesejadas.</li>
              <li>% total deve sempre ser igual a 100%.</li>
              <li>As quantidades relativas da Formulação são calculadas automaticamente ao lado da % do total.</li>
            </ol>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowInstructions(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;