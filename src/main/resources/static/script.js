// Sample data - fallback
let products = [];

// DOM Elements
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

// Pagination variables
let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromAPI();
    setupExcelImportUI();

    // Event listeners
    if (addProductBtn) addProductBtn.addEventListener('click', openAddModal);
    if (saveProductBtn) saveProductBtn.addEventListener('click', saveProduct);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteProduct);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (lowStockFilter) lowStockFilter.addEventListener('change', filterProducts);
    if (sortSelect) sortSelect.addEventListener('change', filterProducts);
    if (prevPageBtn) prevPageBtn.addEventListener('click', goToPrevPage);
    if (nextPageBtn) nextPageBtn.addEventListener('click', goToNextPage);
});

// Render products table
function renderProducts(filteredProducts = products) {
    productsTableBody.innerHTML = '';

    if (filteredProducts.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    showingFrom.textContent = filteredProducts.length > 0 ? startIndex + 1 : 0;
    showingTo.textContent = endIndex;
    totalItems.textContent = filteredProducts.length;

    paginatedProducts.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        const totalValue = product.quantity * product.price;
        const isLowStock = product.quantity > 0 && product.quantity <= 5;
        const isOutOfStock = product.quantity === 0;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.description}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOutOfStock ? 'bg-red-100 text-red-800' : isLowStock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                    ${product.quantity}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ ${product.price.toFixed(2).replace('.', ',')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ ${totalValue.toFixed(2).replace('.', ',')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex gap-2">
                    <button class="edit-btn text-blue-500 hover:text-blue-700" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn text-red-500 hover:text-red-700" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        productsTableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            openEditModal(productId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            openDeleteModal(productId);
        });
    });
}

// Update statistics
function updateStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
    const inStockProducts = products.filter(p => p.quantity > 0).length;
    const outOfStockProducts = products.filter(p => p.quantity === 0).length;

    totalProductsEl.textContent = totalProducts;
    totalValueEl.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
    inStockProductsEl.textContent = inStockProducts;
    outOfStockProductsEl.textContent = outOfStockProducts;
}

// Filter and sort products
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const sortBy = sortSelect.value;
    const showLowStock = lowStockFilter.checked;

    let filtered = products.filter(product => {
        // Pega o nome do produto (suporta 'nome' em PT ou 'name' em EN, com fallback para string vazia)
        const name = (product.nome || product.name || "").toLowerCase();

        // Trata a descrição caso ela exista no JSON ou venha null/undefined
        const description = (product.descricao || product.description || "").toLowerCase();

        // Pega o ID de forma segura
        const id = product.id ? product.id.toString() : "";

        // Busca pelo Nome, Descrição ou ID
        return name.includes(searchTerm) ||
            description.includes(searchTerm) ||
            id.includes(searchTerm);
    });

    if (showLowStock) {
        // Suporta 'quantidade' ou 'quantity'
        filtered = filtered.filter(product => {
            const qty = product.quantidade !== undefined ? product.quantidade : product.quantity;
            return qty > 0 && qty <= 5;
        });
    }

    filtered.sort((a, b) => {
        // Mapeia os atributos com suporte às propriedades em Português do Java
        const aName = a.nome || a.name || "";
        const bName = b.nome || b.name || "";

        const aQty = a.quantidade !== undefined ? a.quantidade : (a.quantity || 0);
        const bQty = b.quantidade !== undefined ? b.quantidade : (b.quantity || 0);

        const aPrice = a.preco !== undefined ? a.preco : (a.price || 0);
        const bPrice = b.preco !== undefined ? b.preco : (b.price || 0);

        if (sortBy === 'id') return a.id - b.id;
        if (sortBy === 'name') return aName.localeCompare(bName);
        if (sortBy === 'quantity') return aQty - bQty;
        if (sortBy === 'price') return aPrice - bPrice;
        return 0;
    });

    totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    renderProducts(filtered);
    renderPagination();
}

// Pagination functions
function renderPagination() {
    pageNumbersContainer.innerHTML = '';

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    if (totalPages === 0) return;

    addPageNumber(1);

    if (currentPage > 3) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-3 py-1';
        ellipsis.textContent = '...';
        pageNumbersContainer.appendChild(ellipsis);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i);
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
    pageBtn.className = `px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-100'}`;
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

// Modal functions
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Adicionar Produto';
    productIdInput.value = '';
    productForm.reset();
    productModal.classList.remove('hidden');
}

function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Editar Produto';
    productIdInput.value = product.id;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productPrice').value = product.price;
    productModal.classList.remove('hidden');
}

function closeModal() {
    productModal.classList.add('hidden');
}

function openDeleteModal(productId) {
    productIdToDelete.value = productId;
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    deleteModal.classList.add('hidden');
}

// CRUD operations
function saveProduct() {
    if (!productForm.checkValidity()) {
        productForm.reportValidity();
        return;
    }

    const id = productIdInput.value ? parseInt(productIdInput.value) : null;

    const payload = {
        nome: document.getElementById('productDescription').value,
        quantidade: parseInt(document.getElementById('productQuantity').value),
        preco: parseFloat(document.getElementById('productPrice').value)
    };

    // CORREÇÃO DA URL DO PUT: passa o ID no caminho quando for edicao
    const url = id ? `http://localhost:8080/produtos/${id}` : 'http://localhost:8080/produtos';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(async res => {
            const text = await res.text();
            if (!res.ok) throw new Error(text || 'Erro ao salvar produto');
            return text ? JSON.parse(text) : {};
        })
        .then(() => {
            alert(id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
            closeModal();
            loadProductsFromAPI();
        })
        .catch(err => {
            console.error(err);
            alert(err.message);
        });
}

function deleteProduct() {
    const productId = parseInt(productIdToDelete.value);

    fetch(`http://localhost:8080/produtos/${productId}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao excluir produto');
            alert('Produto excluído com sucesso!');
            closeDeleteModal();
            loadProductsFromAPI();
        })
        .catch(err => {
            console.error(err);
            alert(err.message);
        });
}

function loadProductsFromAPI() {
    fetch('http://localhost:8080/produtos')
        .then(async res => {
            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            if (!text.trim()) {
                products = [];
                filterProducts();
                updateStats();
                return [];
            }
            return JSON.parse(text);
        })
        .then(data => {
            if (Array.isArray(data)) {
                products = data.map(p => ({
                    id: p.id,
                    description: p.nome,
                    quantity: p.quantidade,
                    price: p.preco
                }));
                currentPage = 1;
                filterProducts();
                updateStats();
            }
        })
        .catch(err => {
            console.error('Erro ao carregar produtos:', err);
        });
}

// ============== EXCEL IMPORT FUNCTIONS ==============

function setupExcelImportUI() {
    const toggleBtn = document.getElementById('toggleImportBtn');
    const importSection = document.getElementById('importSection');
    const arquivoExcel = document.getElementById('arquivoExcel');
    const importBtn = document.getElementById('importBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            importSection.classList.toggle('hidden');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    }

    if (arquivoExcel) arquivoExcel.addEventListener('change', handleFileSelect);

    if (importBtn) {
        importBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const file = arquivoExcel.files[0];
            if (file) {
                visualizarImportacao(file);
            } else {
                showStatusMessage('Selecione um arquivo Excel', 'error');
            }
        });
    }

    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            const file = arquivoExcel.files[0];
            if (file) realizarImportacao(file);
        });
    }

    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            document.getElementById('previewContainer').classList.add('hidden');
            arquivoExcel.value = '';
            showStatusMessage('', '');
        });
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showStatusMessage('Selecione um arquivo Excel válido (.xlsx ou .xls)', 'error');
        event.target.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showStatusMessage('Arquivo muito grande (máximo 10MB)', 'error');
        event.target.value = '';
        return;
    }

    showStatusMessage('Arquivo selecionado: ' + file.name, 'info');
}

function visualizarImportacao(file) {
    const formData = new FormData();
    formData.append('file', file);

    showStatusMessage('Processando arquivo...', 'info');

    fetch('http://localhost:8080/produtos/importar/visualizar', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                showStatusMessage('Erro: ' + data.erro, 'error');
                return;
            }

            displayPreviewTable(data.produtos);
            showStatusMessage(
                `<strong>${data.total} produto(s) encontrado(s)</strong><br>Revise os dados abaixo e confirme a importação`,
                'success'
            );

            document.getElementById('previewContainer').classList.remove('hidden');
        })
        .catch(err => {
            console.error('Erro:', err);
            showStatusMessage('Erro ao processar arquivo: ' + err.message, 'error');
        });
}

function realizarImportacao(file) {
    const formData = new FormData();
    formData.append('file', file);

    showStatusMessage('Importando produtos...', 'info');
    const confirmBtn = document.getElementById('confirmImportBtn');
    if (confirmBtn) confirmBtn.disabled = true;

    fetch('http://localhost:8080/produtos/importar', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso || data.totalImportado !== undefined) {
                const total = data.totalImportado ?? 'vários';
                showStatusMessage(
                    `<strong>✅ Importação Concluída!</strong><br>${total} produto(s) importado(s) com sucesso.`,
                    'success'
                );

                document.getElementById('arquivoExcel').value = '';
                document.getElementById('previewContainer').classList.add('hidden');

                setTimeout(() => {
                    loadProductsFromAPI();
                }, 500);
            } else {
                showStatusMessage('Erro: ' + (data.erro || 'Falha ao importar'), 'error');
            }
        })
        .catch(err => {
            console.error('Erro:', err);
            showStatusMessage('Erro ao importar: ' + err.message, 'error');
        })
        .finally(() => {
            if (confirmBtn) confirmBtn.disabled = false;
        });
}

function displayPreviewTable(produtos) {
    const table = document.getElementById('previewTable');
    if (!table) return;

    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        showStatusMessage('Nenhum produto encontrado no arquivo', 'warning');
        return;
    }

    const headers = ['Nome', 'Quantidade', 'Preço'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'px-6 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100';
        thead.appendChild(th);
    });

    produtos.forEach((produto, index) => {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-white';

        const nomeTd = document.createElement('td');
        nomeTd.textContent = produto.nome;
        nomeTd.className = 'px-6 py-4 text-sm text-gray-900';
        tr.appendChild(nomeTd);

        const quantidadeTd = document.createElement('td');
        quantidadeTd.textContent = produto.quantidade;
        quantidadeTd.className = 'px-6 py-4 text-sm text-gray-900 font-semibold';
        tr.appendChild(quantidadeTd);

        const precoTd = document.createElement('td');
        precoTd.textContent = 'R$ ' + parseFloat(produto.preco).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        precoTd.className = 'px-6 py-4 text-sm text-gray-900 font-semibold';
        tr.appendChild(precoTd);

        tbody.appendChild(tr);
    });
}

function showStatusMessage(message, type) {
    const container = document.getElementById('statusMessage');
    if (!container) return;

    if (!message) {
        container.classList.add('hidden');
        return;
    }

    let bgColor = 'bg-blue-50 border-blue-200 text-blue-800';
    let icon = 'fa-info-circle';

    if (type === 'success') {
        bgColor = 'bg-green-50 border-green-200 text-green-800';
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        bgColor = 'bg-red-50 border-red-200 text-red-800';
        icon = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-50 border-yellow-200 text-yellow-800';
        icon = 'fa-exclamation-triangle';
    }

    container.className = `${bgColor} border rounded-lg p-4 flex items-start gap-3`;
    container.innerHTML = `
        <i class="fas ${icon} text-xl flex-shrink-0 mt-0.5"></i>
        <div class="flex-grow">${message}</div>
    `;
    container.classList.remove('hidden');
}