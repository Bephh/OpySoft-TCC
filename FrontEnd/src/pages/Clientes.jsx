import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Plus, Edit, Trash2, Search, Users, User, Briefcase, Phone, Mail, Clock } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';

// Helper para formatar CPF/CNPJ (simples)
const formatDocument = (doc) => {
  if (!doc) return 'N/A';
  const cleaned = ('' + doc).replace(/\D/g, '');
  if (cleaned.length === 11) {
    // CPF
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleaned.length === 14) {
    // CNPJ
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
};

export default function Clientes() {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null); // Para ver histórico

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "empresas", currentUser.uid, "clientes"),
        orderBy('nome', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const clientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientList);
        setLoading(false);
      }, (error) => {
        console.error("Erro ao buscar clientes:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' ||
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddClient = async (newClientData) => {
    try {
  const clientRef = doc(collection(db, "empresas", currentUser.uid, "clientes"));
      await setDoc(clientRef, {
        ...newClientData,
        documento: newClientData.documento.replace(/\D/g, ''), // Salva apenas números
        tipo: newClientData.documento.replace(/\D/g, '').length === 11 ? 'Pessoa Física' : 'Pessoa Jurídica',
        recorrente: newClientData.recorrente || false,
        data_cadastro: new Date().toISOString(),
      });
      setIsAddModalOpen(false);
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao adicionar Cliente:", error);
      alert("Falha ao adicionar cliente. Verifique o console para detalhes.");
      return Promise.reject(error);
    }
  };

  const handleEditClient = async (id, updatedData) => {
    try {
  await updateDoc(doc(db, "empresas", currentUser.uid, "clientes", id), {
        ...updatedData,
        documento: updatedData.documento.replace(/\D/g, ''), // Salva apenas números
        tipo: updatedData.documento.replace(/\D/g, '').length === 11 ? 'Pessoa Física' : 'Pessoa Jurídica',
      });
      setIsEditModalOpen(false);
      setEditingClient(null);
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao editar Cliente:", error);
      alert("Falha ao editar cliente. Verifique o console para detalhes.");
      return Promise.reject(error);
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este Cliente? Isso não excluirá Ordens de Serviço associadas.')) {
      try {
  await deleteDoc(doc(db, "empresas", currentUser.uid, "clientes", id));
      } catch (error) {
        console.error("Erro ao excluir Cliente:", error);
        alert("Falha ao excluir cliente. Verifique o console para detalhes.");
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Carregando Clientes...</div>;
  }

  return (
    <div className="p-2 sm:p-6 w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center">
        <Users className="mr-3" size={28} />
        Gestão de Clientes
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mb-6">
        <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por Nome, CPF/CNPJ ou Email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white border-gray-600 placeholder-gray-400 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Versão Desktop - Tabela */}
      <div className="hidden lg:block bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Documento</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Telefone</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recorrente</th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-700 transition duration-150">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{client.nome}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDocument(client.documento)}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.email}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.telefone}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.recorrente ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                      {client.recorrente ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-blue-400 hover:text-blue-300 inline-block"
                      title="Ver Histórico"
                    >
                      <Clock size={18} />
                    </button>
                    <button
                      onClick={() => { setEditingClient(client); setIsEditModalOpen(true); }}
                      className="text-indigo-400 hover:text-indigo-300 inline-block"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-400 hover:text-red-300 inline-block"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 sm:px-6 py-4 text-center text-gray-400 bg-gray-800">Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg hover:shadow-xl transition">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Nome</p>
                    <p className="font-semibold text-white text-sm">{client.nome}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.recorrente ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                    {client.recorrente ? 'Recorrente' : 'Pontual'}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Documento</p>
                  <p className="text-sm text-gray-300">{formatDocument(client.documento)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Email</p>
                  <p className="text-sm text-gray-300 truncate">{client.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Telefone</p>
                  <p className="text-sm text-gray-300">{client.telefone}</p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-700">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-2 rounded transition flex items-center justify-center gap-1"
                    title="Ver Histórico"
                  >
                    <Clock size={16} />
                    Histórico
                  </button>
                  <button
                    onClick={() => { setEditingClient(client); setIsEditModalOpen(true); }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-2 rounded transition flex items-center justify-center gap-1"
                    title="Editar"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-2 rounded transition flex items-center justify-center gap-1"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400 py-8 bg-gray-800 rounded-lg border border-gray-700">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* Modal de Adicionar Cliente */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClient}
      />

      {/* Modal de Edição de Cliente */}
      {isEditModalOpen && editingClient && (
        <AddClientModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingClient(null); }}
          onAdd={(updatedData) => handleEditClient(editingClient.id, updatedData)}
          initialData={editingClient}
        />
      )}

      {/* Seção de Histórico de Atendimentos (Placeholder) */}
      {selectedClient && (
        <div className="mt-8 p-4 sm:p-6 bg-gray-800 shadow-lg rounded-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center text-white">
            <Clock className="mr-2 text-gray-400" size={24} />
            Histórico de Atendimentos de {selectedClient.nome}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Aqui seria carregado o histórico de Ordens de Serviço e atendimentos do cliente {selectedClient.nome}.
            <br/>
            <strong>ID do Cliente:</strong> {selectedClient.id}
          </p>
          <button
            onClick={() => setSelectedClient(null)}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Fechar Histórico
          </button>
        </div>
      )}
    </div>
  );
}
