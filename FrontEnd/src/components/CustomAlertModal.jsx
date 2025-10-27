import React from 'react';

const CustomAlertModal = ({ type = 'info', title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar" }) => {
    // Estilos baseados no tipo de alerta
    let headerStyle = 'bg-blue-600';
    let icon = (
        <svg className="w-6 h-6 text-blue-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
        </svg>
    );

    if (type === 'error') {
        headerStyle = 'bg-red-600';
        icon = (
            <svg className="w-6 h-6 text-red-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
        );
    } else if (type === 'success') {
         headerStyle = 'bg-green-600';
         icon = (
            <svg className="w-6 h-6 text-green-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
        );
    } else if (type === 'confirm') {
         headerStyle = 'bg-yellow-600';
         icon = (
            <svg className="w-6 h-6 text-yellow-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.34c.5-1.03 1.714-1.03 2.214 0l.4 1.054a1 1 0 00.916.657h1.092c1.071 0 1.62.97 1.054 1.83l-.84.887a1 1 0 00-.276.965l.26 1.157c.237 1.053-.464 2.01-1.354 2.01h-1.011a1 1 0 00-.916.657l-.4 1.054a1 1 0 01-.916.657H8.257a1 1 0 01-.916-.657l-.4-1.054a1 1 0 00-.916-.657H4.914c-.89 0-1.591-.957-1.354-2.01l.26-1.157a1 1 0 00-.276-.965l-.84-.887c-.566-.86.003-1.83 1.054-1.83h1.092a1 1 0 00.916-.657l.4-1.054z" clipRule="evenodd"></path>
            </svg>
        );
    }
    
    const isConfirmation = onConfirm && onCancel;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 bg-gray-900/75 transition-opacity" aria-hidden="true"></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Painel do Modal */}
                <div className="inline-block align-bottom bg-[#0f172a] rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    
                    {/* Header Estilizado */}
                    <div className={`p-4 ${headerStyle} flex items-center rounded-t-xl`}>
                        <div className="mr-3">{icon}</div>
                        <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                            {title}
                        </h3>
                    </div>

                    {/* Corpo do Modal */}
                    <div className="px-6 pt-5 pb-6">
                        <p className="text-sm text-gray-300">{message}</p>
                    </div>

                    {/* Ações (Botões) */}
                    <div className="px-6 py-4 bg-[#1e293b] flex justify-end gap-3 rounded-b-xl">
                        {isConfirmation && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 sm:text-sm transition"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm transition 
                                ${isConfirmation ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomAlertModal;