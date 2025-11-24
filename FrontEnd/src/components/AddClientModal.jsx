import React, { useState } from 'react';
import { X, Save, Users } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onAdd, initialData = null }) {
  const [formData, setFormData] = useState(initialData ? {
    nome: initialData.nome || '',
    documento: initialData.documento || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    endereco: initialData.endereco || '',
    recorrente: initialData.recorrente || false,
  } : {
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    endereco: '',
    recorrente: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;
    if (type === 'checkbox') {
      finalValue = checked;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Validação básica
    if (!formData.nome || !formData.documento || !formData.email) {
      alert("Por favor, preencha o nome, documento (CPF/CNPJ) e email do cliente.");
      setIsSaving(false);
      return;
    }

    // Payload final
    const payload = {
      ...formData,
    };

    onAdd(payload)
      .then(() => {
        setIsSaving(false);
        // Resetar formulário após sucesso (apenas se for adição)
        if (!initialData) {
          setFormData({
            nome: '',
            documento: '',
            email: '',
            telefone: '',
            endereco: '',
            recorrente: false,
          });
        }
      })
      .catch(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-[#0b1220] p-8 rounded-2xl shadow-2xl shadow-blue-900/50 w-full max-w-lg max-h-[95vh] flex flex-col transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 mb-6 flex-shrink-0">
          <h2 className="text-2xl font-extrabold text-blue-400">
            {initialData ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-300 mb-1">Nome *</label>
              <input
                type="text"
                name="nome"
                id="nome"
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                required
              />
            </div>

            {/* Documento e Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="documento" className="block text-sm font-semibold text-gray-300 mb-1">CPF/CNPJ *</label>
                <input
                  type="text"
                  name="documento"
                  id="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  required
                />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-semibold text-gray-300 mb-1">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                required
              />
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="endereco" className="block text-sm font-semibold text-gray-300 mb-1">Endereço</label>
              <textarea
                name="endereco"
                id="endereco"
                rows="2"
                value={formData.endereco}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              ></textarea>
            </div>

            {/* Recorrente */}
            <div className="flex items-center">
              <input
                id="recorrente"
                name="recorrente"
                type="checkbox"
                checked={formData.recorrente}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-[#1e293b]"
              />
              <label htmlFor="recorrente" className="ml-2 block text-sm font-semibold text-gray-300">
                Cliente Recorrente
              </label>
            </div>
          

          <div className="mt-6 flex justify-end space-x-3 border-t border-gray-700/50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
              disabled={isSaving}
            >
              <Save size={18} className="mr-2" />
              {isSaving ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Cadastrar Cliente')}
            </button>
          </div>
        </form>
        
        </div>
      </div>
    </div>
  );
}
