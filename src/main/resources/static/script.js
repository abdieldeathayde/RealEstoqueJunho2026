// ============================================================
// ESTOQUE REALCAR - SCRIPT PRINCIPAL
// ============================================================

// Produtos carregados da API
let products = [];

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

const API_URL = 'http://localhost:8080/produtos';

// ============================================================
// ELEMENTOS DO DOM
// ============================================================

const productsTableBody = document.getElementById('productsTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const lowStockFilter = document.getElementById('lowStockFilter');
const sortSelect = document.getElementById('sortSelect');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const saveProductBtn = document.getElementById('saveProduct');
const cancelModalBtn = document.getElementById('cancelModal');
const closeModalBtn = document.getElementById('closeModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
const productIdInput = document.getElementById('productId');
const productIdToDelete = document.getElementById('productIdToDelete');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbersContainer = document.getElementById('pageNumbers');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalItems = document.getElementById('totalItems');
const totalProductsEl = document.getElementById('totalProducts');
const totalValueEl = document.getElementById('totalValue');
const inStockProductsEl = document.getElementById('inStockProducts');
const outOfStockProductsEl = document.getElementById('outOfStockProducts');

// ============================================================
// PAGINAÇÃO
// ============================================================

let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema de estoque iniciado.');

    loadProductsFromAPI();
    setupExcelImportUI();

    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddModal);
    }

    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', saveProduct);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteProduct);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    if (lowStockFilter) {
        lowStockFilter.addEventListener('change', filterProducts);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPrevPage);
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPage);
    }
});

// ============================================================
// CARREGAR PRODUTOS DA API
// ============================================================

function loadProductsFromAPI() {
    console.log('Carregando produtos da API...');

    fetch(API_URL)
        .then(async response => {
            const text = await response.text();
            console.log('Resposta da API:', text);

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            if (!text.trim()) {
                return [];
            }

            try {
                return JSON.parse(text);
            } catch (error) {
                throw new Error('A API retornou um JSON inválido.');
            }
        })
        .then(data => {
            console.log('Produtos carregados:', data);

            if (!Array.isArray(data)) {
                throw new Error('A API não retornou uma lista de produtos.');
            }

            // Normalização dos dados do Spring
            products = data.map(product => {
                return {
                    id: product.id ?? null,
                    codigo: product.codigo != null ? String(product.codigo) : '',
                    description: product.descricao ?? '',
                    quantity: Number(product.quantidade ?? product.quantity ?? 0),
                    price: Number(product.valor ?? product.price ?? 0)
                };
            });

            console.log('Produtos normalizados:', products);
            currentPage = 1;
            filterProducts();
            updateStats();
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            products = [];
            filterProducts();
            updateStats();
            showStatusMessage('Não foi possível carregar os produtos da API.', 'error');
        });
}

// ============================================================
// RENDERIZAR PRODUTOS
// ============================================================

function renderProducts(filteredProducts = products) {
    if (!productsTableBody) return;

    productsTableBody.innerHTML = '';

    if (!filteredProducts || filteredProducts.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (showingFrom) showingFrom.textContent = '0';
        if (showingTo) showingTo.textContent = '0';
        if (totalItems) totalItems.textContent = '0';
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    if (showingFrom) showingFrom.textContent = startIndex + 1;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalItems) totalItems.textContent = filteredProducts.length;

    paginatedProducts.forEach(product => {
        const quantity = Number(product.quantity ?? 0);
        const price = Number(product.price ?? 0);
        const totalValue = quantity * price;

        const isLowStock = quantity > 0 && quantity <= 5;
        const isOutOfStock = quantity === 0;

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${escapeHtml(product.id ?? '')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${escapeHtml(product.codigo ?? '')}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                ${escapeHtml(product.description ?? '')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isOutOfStock
                ? 'bg-red-100 text-red-800'
                : isLowStock
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
        }">
                    ${quantity}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                R$ ${formatCurrency(price)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                R$ ${formatCurrency(totalValue)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex gap-2">
                    <button type="button" class="edit-btn text-blue-500 hover:text-blue-700" data-id="${product.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="delete-btn text-red-500 hover:text-red-700" data-id="${product.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        productsTableBody.appendChild(row);
    });

    // Eventos Botoes Editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', event => {
            const id = event.currentTarget.getAttribute('data-id');
            openEditModal(id);
        });
    });

    // Eventos Botoes Excluir
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', event => {
            const id = event.currentTarget.getAttribute('data-id');
            openDeleteModal(id);
        });
    });
}

// ============================================================
// ESTATÍSTICAS
// ============================================================

function updateStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => {
        const quantity = Number(product.quantity ?? 0);
        const price = Number(product.price ?? 0);
        return sum + (quantity * price);
    }, 0);

    const inStockProducts = products.filter(p => Number(p.quantity ?? 0) > 0).length;
    const outOfStockProducts = products.filter(p => Number(p.quantity ?? 0) === 0).length;

    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (totalValueEl) totalValueEl.textContent = `R$ ${formatCurrency(totalValue)}`;
    if (inStockProductsEl) inStockProductsEl.textContent = inStockProducts;
    if (outOfStockProductsEl) outOfStockProductsEl.textContent = outOfStockProducts;
}

// ============================================================
// FILTRAR PRODUTOS
// ============================================================

function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const showLowStock = lowStockFilter ? lowStockFilter.checked : false;
    const sortBy = sortSelect ? sortSelect.value : 'id';

    let filtered = products.filter(product => {
        const codigo = String(product.codigo ?? '').toLowerCase();
        const description = String(product.description ?? '').toLowerCase();
        const id = String(product.id ?? '');

        return (
            codigo.includes(searchTerm) ||
            description.includes(searchTerm) ||
            id.includes(searchTerm)
        );
    });

    if (showLowStock) {
        filtered = filtered.filter(product => {
            const quantity = Number(product.quantity ?? 0);
            return quantity > 0 && quantity <= 5;
        });
    }

    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'id':
                return Number(a.id ?? 0) - Number(b.id ?? 0);
            case 'name':
                return String(a.description ?? '').localeCompare(String(b.description ?? ''));
            case 'quantity':
                return Number(a.quantity ?? 0) - Number(b.quantity ?? 0);
            case 'price':
                return Number(a.price ?? 0) - Number(b.price ?? 0);
            default:
                return 0;
        }
    });

    totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (totalPages < 1) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    renderProducts(filtered);
    renderPagination();
}

// ============================================================
// PAGINAÇÃO
// ============================================================

function renderPagination() {
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = '';

    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || products.length === 0;

    if (products.length === 0) return;

    addPageNumber(1);

    if (currentPage > 3) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-3 py-1';
        ellipsis.textContent = '...';
        pageNumbersContainer.appendChild(ellipsis);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page++) {
        if (page > 1 && page < totalPages) {
            addPageNumber(page);
        }
    }

    if (currentPage < totalPages - 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-3 py-1';
        ellipsis.textContent = '...';
        pageNumbersContainer.appendChild(ellipsis);
    }

    if (totalPages > 1) {
        addPageNumber(totalPages);
    }
}

function addPageNumber(page) {
    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.className = `px-3 py-1 rounded-lg ${
        currentPage === page
            ? 'bg-blue-500 text-white'
            : 'border border-gray-300 hover:bg-gray-100'
    }`;
    pageBtn.textContent = page;

    pageBtn.addEventListener('click', () => {
        currentPage = page;
        filterProducts();
    });

    pageNumbersContainer.appendChild(pageBtn);
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        filterProducts();
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        filterProducts();
    }
}

// ============================================================
// MODAL - ADICIONAR / EDITAR
// ============================================================

function openAddModal() {
    if (!productModal) return;

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Adicionar Produto';
    if (productIdInput) productIdInput.value = '';
    if (productForm) productForm.reset();

    productModal.classList.remove('hidden');
}

function openEditModal(productId) {
    const product = products.find(p => String(p.id) === String(productId));

    if (!product) {
        console.error('Produto não encontrado:', productId);
        return;
    }

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Editar Produto';
    if (productIdInput) productIdInput.value = product.id;

    const productCode = document.getElementById('productCode');
    const productDescription = document.getElementById('productDescription');
    const productQuantity = document.getElementById('productQuantity');
    const productPrice = document.getElementById('productPrice');

    if (productCode) productCode.value = product.codigo ?? '';
    if (productDescription) productDescription.value = product.description ?? '';
    if (productQuantity) productQuantity.value = product.quantity ?? 0;
    if (productPrice) productPrice.value = product.price ?? 0;

    if (productModal) productModal.classList.remove('hidden');
}

function closeModal() {
    if (productModal) productModal.classList.add('hidden');
}

// ============================================================
// MODAL EXCLUSÃO
// ============================================================

function openDeleteModal(productId) {
    if (productIdToDelete) productIdToDelete.value = productId;
    if (deleteModal) deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    if (deleteModal) deleteModal.classList.add('hidden');
}

// ============================================================
// SALVAR PRODUTO
// ============================================================

async function saveProduct() {
    if (!productForm) return;

    if (!productForm.checkValidity()) {
        productForm.reportValidity();
        return;
    }

    const id = productIdInput && productIdInput.value ? productIdInput.value : null;
    const codeElement = document.getElementById('productCode');
    const descriptionElement = document.getElementById('productDescription');
    const quantityElement = document.getElementById('productQuantity');
    const priceElement = document.getElementById('productPrice');

    const payload = {
        codigo: codeElement ? codeElement.value.trim() : '',
        descricao: descriptionElement ? descriptionElement.value.trim() : '',
        quantidade: quantityElement ? parseInt(quantityElement.value, 10) : 0,
        valor: priceElement ? parseFloat(priceElement.value.replace(',', '.')) : 0
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || `Erro HTTP ${response.status}`);
        }

        alert(id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        closeModal();
        await loadProductsFromAPI();

    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert(`Erro ao salvar produto: ${error.message}`);
    }
}

// ============================================================
// EXCLUIR PRODUTO
// ============================================================

async function deleteProduct() {
    if (!productIdToDelete) return;
    const productId = productIdToDelete.value;
    if (!productId) return;

    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Erro HTTP ${response.status}`);
        }

        alert('Produto excluído com sucesso!');
        closeDeleteModal();
        await loadProductsFromAPI();

    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert(`Erro ao excluir produto: ${error.message}`);
    }
}

// ============================================================
// IMPORTAÇÃO EXCEL UI & EVENTOS
// ============================================================

function setupExcelImportUI() {
    const toggleBtn = document.getElementById('toggleImportBtn');
    const importSection = document.getElementById('importSection');
    const arquivoExcel = document.getElementById('arquivoExcel');
    const importBtn = document.getElementById('importBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (importSection) importSection.classList.toggle('hidden');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    }

    if (arquivoExcel) {
        arquivoExcel.addEventListener('change', handleFileSelect);
    }

    if (importBtn) {
        importBtn.addEventListener('click', event => {
            event.preventDefault();
            if (!arquivoExcel) return;
            const file = arquivoExcel.files[0];
            if (!file) {
                showStatusMessage('Selecione um arquivo Excel.', 'error');
                return;
            }
            visualizarImportacao(file);
        });
    }

    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            if (!arquivoExcel) return;
            const file = arquivoExcel.files[0];
            if (!file) {
                showStatusMessage('Selecione um arquivo Excel.', 'error');
                return;
            }
            realizarImportacao(file);
        });
    }

    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            const previewContainer = document.getElementById('previewContainer');
            if (previewContainer) previewContainer.classList.add('hidden');
            if (arquivoExcel) arquivoExcel.value = '';
            showStatusMessage('', '');
        });
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        showStatusMessage('Selecione um arquivo Excel válido (.xlsx ou .xls).', 'error');
        event.target.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showStatusMessage('Arquivo muito grande. O limite é 10MB.', 'error');
        event.target.value = '';
        return;
    }

    showStatusMessage(`Arquivo selecionado: ${file.name}`, 'info');
}

// ============================================================
// VISUALIZAR IMPORTAÇÃO EXCEL
// ============================================================

async function visualizarImportacao(file) {
    const formData = new FormData();
    formData.append('file', file);

    showStatusMessage('Processando arquivo Excel...', 'info');

    try {
        const response = await fetch(`${API_URL}/importar/visualizar`, {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            throw new Error('O servidor retornou uma resposta inválida.');
        }

        if (!response.ok) {
            throw new Error(data.erro || data.message || `Erro HTTP ${response.status}`);
        }

        if (data.erro) {
            showStatusMessage(`Erro: ${data.erro}`, 'error');
            return;
        }

        console.log('Pré-visualização:', data);
        const produtos = data.produtos ?? data.produtosImportados ?? data ?? [];

        displayPreviewTable(produtos);

        showStatusMessage(
            `<strong>${produtos.length} produto(s) encontrado(s)</strong><br>` +
            'Revise os dados abaixo e confirme a importação.',
            'success'
        );

        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Erro ao visualizar Excel:', error);
        showStatusMessage(`Erro ao processar arquivo: ${error.message}`, 'error');
    }
}

// ============================================================
// REALIZAR IMPORTAÇÃO DEFINITIVA
// ============================================================

async function realizarImportacao(file) {
    const formData = new FormData();
    formData.append('file', file);

    showStatusMessage('Importando produtos...', 'info');

    const confirmBtn = document.getElementById('confirmImportBtn');
    if (confirmBtn) confirmBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/importar`, {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            throw new Error('O servidor retornou uma resposta inválida.');
        }

        if (!response.ok) {
            throw new Error(data.erro || data.message || `Erro HTTP ${response.status}`);
        }

        console.log('Resultado da importação:', data);

        if (
            data.sucesso === true ||
            data.totalImportado !== undefined ||
            data.quantidadeImportada !== undefined ||
            response.ok
        ) {
            const total = data.totalImportado ?? data.quantidadeImportada ?? data.total ?? 0;

            showStatusMessage(
                `<strong>Importação concluída!</strong><br>` +
                `${total} produto(s) importado(s) com sucesso.`,
                'success'
            );

            const arquivoExcel = document.getElementById('arquivoExcel');
            if (arquivoExcel) arquivoExcel.value = '';

            const previewContainer = document.getElementById('previewContainer');
            if (previewContainer) previewContainer.classList.add('hidden');

            await loadProductsFromAPI();

        } else {
            showStatusMessage(
                `Erro: ${data.erro || data.message || 'Falha ao importar produtos.'}`,
                'error'
            );
        }

    } catch (error) {
        console.error('Erro ao importar Excel:', error);
        showStatusMessage(`Erro ao importar: ${error.message}`, 'error');

    } finally {
        if (confirmBtn) confirmBtn.disabled = false;
    }
}

// ============================================================
// TABELA DE PRÉ-VISUALIZAÇÃO DE IMPORTAÇÃO
// ============================================================

function displayPreviewTable(produtos) {
    const table = document.getElementById('previewTable');
    if (!table) return;

    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    if (!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!Array.isArray(produtos) || produtos.length === 0) {
        showStatusMessage('Nenhum produto encontrado no arquivo.', 'warning');
        return;
    }

    thead.innerHTML = `
        <th class="px-4 py-2 border bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
        <th class="px-4 py-2 border bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
        <th class="px-4 py-2 border bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">Qtd</th>
        <th class="px-4 py-2 border bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase">Preço Unit.</th>
    `;

    produtos.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        const codigo = escapeHtml(item.codigo ?? item.code ?? '');
        const descricao = escapeHtml(item.descricao ?? item.description ?? '');
        const quantidade = Number(item.quantidade ?? item.quantity ?? 0);
        const valor = Number(item.valor ?? item.price ?? 0);

        row.innerHTML = `
            <td class="px-4 py-2 border text-sm text-gray-700">${codigo}</td>
            <td class="px-4 py-2 border text-sm text-gray-700">${descricao}</td>
            <td class="px-4 py-2 border text-sm text-center text-gray-700">${quantidade}</td>
            <td class="px-4 py-2 border text-sm text-right text-gray-700">R$ ${formatCurrency(valor)}</td>
        `;

        tbody.appendChild(row);
    });
}

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

function showStatusMessage(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;

    if (!message) {
        statusEl.innerHTML = '';
        statusEl.className = 'hidden';
        return;
    }

    statusEl.innerHTML = message;

    const styles = {
        info: 'p-3 rounded bg-blue-50 text-blue-700 border border-blue-200 text-sm mb-4',
        success: 'p-3 rounded bg-green-50 text-green-700 border border-green-200 text-sm mb-4',
        error: 'p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm mb-4',
        warning: 'p-3 rounded bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm mb-4'
    };

    statusEl.className = styles[type] || styles.info;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatCurrency(value) {
    return Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}