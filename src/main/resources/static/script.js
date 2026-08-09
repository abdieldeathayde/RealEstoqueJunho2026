// ==========================================================
// DADOS
// ==========================================================

let products = [];

// ==========================================================
// ELEMENTOS DOM
// ==========================================================

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

// ==========================================================
// PAGINAÇÃO
// ==========================================================

let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

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

// ==========================================================
// RENDERIZAÇÃO
// ==========================================================

function renderProducts(filteredProducts = products) {

    if (!productsTableBody) {
        return;
    }

    productsTableBody.innerHTML = '';

    if (!filteredProducts || filteredProducts.length === 0) {

        if (emptyState) {
            emptyState.classList.remove('hidden');
        }

        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = Math.min(
        startIndex + itemsPerPage,
        filteredProducts.length
    );

    const paginatedProducts =
        filteredProducts.slice(startIndex, endIndex);

    if (showingFrom) {
        showingFrom.textContent = startIndex + 1;
    }

    if (showingTo) {
        showingTo.textContent = endIndex;
    }

    if (totalItems) {
        totalItems.textContent = filteredProducts.length;
    }

    paginatedProducts.forEach(product => {

        const row = document.createElement('tr');

        row.className = 'hover:bg-gray-50';

        // Conversão segura dos valores
        const quantidade =
            Number(product.quantidade) || 0;

        const valor =
            Number(product.valor) || 0;

        const totalValue =
            quantidade * valor;

        const isLowStock =
            quantidade > 0 && quantidade <= 5;

        const isOutOfStock =
            quantidade === 0;

        row.innerHTML = `

<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
    ${product.codigo ?? product.id ?? ''}
</td>

<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    ${product.descricao ?? ''}
</td>

<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                        isOutOfStock
                            ? 'bg-red-100 text-red-800'
                            : isLowStock
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                    }">

                    ${quantidade}

                </span>

</td>

<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

    R$ ${valor
    .toFixed(2)
    .replace('.', ',')}

</td>

<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">

    R$ ${totalValue
    .toFixed(2)
    .replace('.', ',')}

</td>

<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

    <div class="flex gap-2">

        <button
            class="edit-btn text-blue-500 hover:text-blue-700"
            data-id="${product.id}">
            <i class="fas fa-edit"></i>
        </button>

        <button
            class="delete-btn text-red-500 hover:text-red-700"
            data-id="${product.id}">
            <i class="fas fa-trash"></i>
        </button>

    </div>

</td>
    `;

        productsTableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {

        btn.addEventListener('click', event => {

            const productId =
                Number(event.currentTarget.dataset.id);

            openEditModal(productId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {

        btn.addEventListener('click', event => {

            const productId =
                Number(event.currentTarget.dataset.id);

            openDeleteModal(productId);
        });
    });
}

// ==========================================================
// ESTATÍSTICAS
// ==========================================================

function updateStats() {

    const totalProducts = products.length;

    const totalValue = products.reduce(
        (sum, product) => {

            const quantidade =
                Number(product.quantidade) || 0;

            const valor =
                Number(product.valor) || 0;

            return sum + (quantidade * valor);

        },
        0
    );

    const inStockProducts =
        products.filter(
            product => Number(product.quantidade) > 0
        ).length;

    const outOfStockProducts =
        products.filter(
            product => Number(product.quantidade) === 0
        ).length;

    if (totalProductsEl) {
        totalProductsEl.textContent = totalProducts;
    }

    if (totalValueEl) {

        totalValueEl.textContent =
            `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
    }

    if (inStockProductsEl) {
        inStockProductsEl.textContent =
            inStockProducts;
    }

    if (outOfStockProductsEl) {
        outOfStockProductsEl.textContent =
            outOfStockProducts;
    }
}

// ==========================================================
// FILTRO E ORDENAÇÃO
// ==========================================================

function filterProducts() {

    const searchTerm =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : '';

    const sortBy =
        sortSelect
            ? sortSelect.value
            : 'id';

    const showLowStock =
        lowStockFilter
            ? lowStockFilter.checked
            : false;

    let filtered = products.filter(product => {

        const descricao =
            String(product.descricao ?? '')
                .toLowerCase();

        const codigo =
            String(product.codigo ?? '');

        const id =
            String(product.id ?? '');

        return (
            descricao.includes(searchTerm) ||
            codigo.includes(searchTerm) ||
            id.includes(searchTerm)
        );
    });

    if (showLowStock) {

        filtered = filtered.filter(product => {

            const quantidade =
                Number(product.quantidade) || 0;

            return quantidade > 0 &&
                   quantidade <= 5;
        });
    }

    filtered.sort((a, b) => {

        const aDescricao =
            String(a.descricao ?? '');

        const bDescricao =
            String(b.descricao ?? '');

        const aQuantidade =
            Number(a.quantidade) || 0;

        const bQuantidade =
            Number(b.quantidade) || 0;

        const aValor =
            Number(a.valor) || 0;

        const bValor =
            Number(b.valor) || 0;

        if (sortBy === 'id') {
            return Number(a.id) - Number(b.id);
        }

        if (sortBy === 'name') {
            return aDescricao.localeCompare(bDescricao);
        }

        if (sortBy === 'quantity') {
            return aQuantidade - bQuantidade;
        }

        if (sortBy === 'price') {
            return aValor - bValor;
        }

        return 0;
    });

    totalPages =
        Math.ceil(filtered.length / itemsPerPage);

    if (totalPages === 0) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    renderProducts(filtered);
    renderPagination();
}

// ==========================================================
// PAGINAÇÃO
// ==========================================================

function renderPagination() {

    if (!pageNumbersContainer) {
        return;
    }

    pageNumbersContainer.innerHTML = '';

    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }

    if (nextPageBtn) {
        nextPageBtn.disabled =
            currentPage === totalPages ||
            totalPages === 0;
    }

    if (totalPages === 0) {
        return;
    }

    addPageNumber(1);

    if (currentPage > 3) {

        const ellipsis =
            document.createElement('span');

        ellipsis.className = 'px-3 py-1';
        ellipsis.textContent = '...';

        pageNumbersContainer.appendChild(ellipsis);
    }

    const startPage =
        Math.max(2, currentPage - 1);

    const endPage =
        Math.min(totalPages - 1, currentPage + 1);

    for (
        let i = startPage;
        i <= endPage;
        i++
    ) {
        addPageNumber(i);
    }

    if (currentPage < totalPages - 2) {

        const ellipsis =
            document.createElement('span');

        ellipsis.className = 'px-3 py-1';
        ellipsis.textContent = '...';

        pageNumbersContainer.appendChild(ellipsis);
    }

    if (totalPages > 1) {
        addPageNumber(totalPages);
    }
}

function addPageNumber(page) {

    const pageBtn =
        document.createElement('button');

    pageBtn.className =
        `px-3 py-1 rounded-lg ${
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

// ==========================================================
// MODAIS
// ==========================================================

function openAddModal() {

    document.getElementById('modalTitle').textContent =
        'Adicionar Produto';

    productIdInput.value = '';

    productForm.reset();

    productModal.classList.remove('hidden');
}

function openEditModal(productId) {

    const product =
        products.find(
            p => Number(p.id) === Number(productId)
        );

    if (!product) {
        return;
    }

    document.getElementById('modalTitle').textContent =
        'Editar Produto';

    productIdInput.value = product.id;

    document.getElementById(
        'productDescription'
    ).value = product.descricao ?? '';

    document.getElementById(
        'productQuantity'
    ).value = product.quantidade ?? 0;

    document.getElementById(
        'productPrice'
    ).value = product.valor ?? 0;

    productModal.classList.remove('hidden');
}

function closeModal() {

    if (productModal) {
        productModal.classList.add('hidden');
    }
}

function openDeleteModal(productId) {

    productIdToDelete.value = productId;

    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {

    if (deleteModal) {
        deleteModal.classList.add('hidden');
    }
}

// ==========================================================
// SALVAR PRODUTO
// ==========================================================

function saveProduct() {

    if (!productForm.checkValidity()) {

        productForm.reportValidity();

        return;
    }

    const id =
        productIdInput.value
            ? Number(productIdInput.value)
            : null;

    const payload = {

        // IMPORTANTE:
        // Os nomes devem ser iguais aos campos
        // do ProdutoRequestDTO.

        codigo: id ?? 0,

        descricao:
            document.getElementById(
                'productDescription'
            ).value.trim(),

        quantidade:
            Number(
                document.getElementById(
                    'productQuantity'
                ).value
            ),

        valor:
            Number(
                document.getElementById(
                    'productPrice'
                ).value
            )
    };

    const url =
        id
            ? `http://localhost:8080/produtos/${id}`
    : 'http://localhost:8080/produtos';

const method =
    id ? 'PUT' : 'POST';

fetch(url, {

    method: method,

    headers: {
        'Content-Type': 'application/json'
    },

    body: JSON.stringify(payload)

})

    .then(async response => {

        const text =
            await response.text();

        if (!response.ok) {

            throw new Error(
                text || 'Erro ao salvar produto'
            );
        }

        return text
            ? JSON.parse(text)
            : {};
    })

    .then(() => {

        alert(
            id
                ? 'Produto atualizado com sucesso!'
                : 'Produto cadastrado com sucesso!'
        );

        closeModal();

        loadProductsFromAPI();
    })

    .catch(error => {

        console.error(
            'Erro ao salvar produto:',
            error
        );

        alert(error.message);
    });
}

// ==========================================================
// EXCLUIR PRODUTO
// ==========================================================

function deleteProduct() {

    const productId =
        Number(productIdToDelete.value);

    fetch(
        `http://localhost:8080/produtos/${productId}`,
        {
            method: 'DELETE'
        }
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    'Erro ao excluir produto'
                );
            }

            alert(
                'Produto excluído com sucesso!'
            );

            closeDeleteModal();

            loadProductsFromAPI();
        })

        .catch(error => {

            console.error(error);

            alert(error.message);
        });
}

// ==========================================================
// CARREGAR PRODUTOS DA API
// ==========================================================

function loadProductsFromAPI() {

    fetch('http://localhost:8080/produtos')

        .then(async response => {

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            if (!text.trim()) {

                products = [];

                currentPage = 1;

                filterProducts();

                updateStats();

                return [];
            }

            return JSON.parse(text);
        })

        .then(data => {

            if (!Array.isArray(data)) {

                console.error(
                    'A API não retornou uma lista:',
                    data
                );

                products = [];

                filterProducts();

                updateStats();

                return;
            }

            /*
             * Converte o JSON do Spring para
             * o padrão usado pelo JavaScript.
             *
             * Backend:
             *
             * {
             *   id,
             *   codigo,
             *   descricao,
             *   quantidade,
             *   valor
             * }
             */

            products = data.map(product => ({

                id: product.id,

                codigo: product.codigo,

                descricao: product.descricao ?? '',

                quantidade:
                    Number(product.quantidade) || 0,

                valor:
                    Number(product.valor) || 0
            }));

            console.log(
                'Produtos carregados:',
                products
            );

            currentPage = 1;

            filterProducts();

            updateStats();
        })

        .catch(error => {

            console.error(
                'Erro ao carregar produtos:',
                error
            );

            products = [];

            filterProducts();

            updateStats();
        });
}

// ==========================================================
// IMPORTAÇÃO EXCEL
// ==========================================================

function setupExcelImportUI() {

    const toggleBtn =
        document.getElementById(
            'toggleImportBtn'
        );

    const importSection =
        document.getElementById(
            'importSection'
        );

    const arquivoExcel =
        document.getElementById(
            'arquivoExcel'
        );

    const importBtn =
        document.getElementById(
            'importBtn'
        );

    const confirmImportBtn =
        document.getElementById(
            'confirmImportBtn'
        );

    const cancelImportBtn =
        document.getElementById(
            'cancelImportBtn'
        );

    if (toggleBtn) {

        toggleBtn.addEventListener(
            'click',
            () => {

                importSection.classList.toggle(
                    'hidden'
                );

                const icon =
                    toggleBtn.querySelector('i');

                if (icon) {

                    icon.classList.toggle(
                        'fa-chevron-down'
                    );

                    icon.classList.toggle(
                        'fa-chevron-up'
                    );
                }
            }
        );
    }

    if (arquivoExcel) {

        arquivoExcel.addEventListener(
            'change',
            handleFileSelect
        );
    }

    if (importBtn) {

        importBtn.addEventListener(
            'click',
            event => {

                event.preventDefault();

                const file =
                    arquivoExcel.files[0];

                if (file) {

                    visualizarImportacao(file);

                } else {

                    showStatusMessage(
                        'Selecione um arquivo Excel',
                        'error'
                    );
                }
            }
        );
    }

    if (confirmImportBtn) {

        confirmImportBtn.addEventListener(
            'click',
            () => {

                const file =
                    arquivoExcel.files[0];

                if (file) {
                    realizarImportacao(file);
                }
            }
        );
    }

    if (cancelImportBtn) {

        cancelImportBtn.addEventListener(
            'click',
            () => {

                document
                    .getElementById(
                        'previewContainer'
                    )
                    .classList.add('hidden');

                arquivoExcel.value = '';

                showStatusMessage('', '');
            }
        );
    }
}

function handleFileSelect(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    if (
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.xls')
    ) {

        showStatusMessage(
            'Selecione um arquivo Excel válido (.xlsx ou .xls)',
            'error'
        );

        event.target.value = '';

        return;
    }

    if (file.size > 10 * 1024 * 1024) {

        showStatusMessage(
            'Arquivo muito grande (máximo 10MB)',
            'error'
        );

        event.target.value = '';

        return;
    }

    showStatusMessage(
        'Arquivo selecionado: ' + file.name,
        'info'
    );
}

function visualizarImportacao(file) {

    const formData =
        new FormData();

    formData.append(
        'file',
        file
    );

    showStatusMessage(
        'Processando arquivo...',
        'info'
    );

    fetch(
        'http://localhost:8080/produtos/importar/visualizar',
        {
            method: 'POST',
            body: formData
        }
    )

        .then(response => response.json())

        .then(data => {

            if (data.erro) {

                showStatusMessage(
                    'Erro: ' + data.erro,
                    'error'
                );

                return;
            }

            displayPreviewTable(
                data.produtos
            );

            showStatusMessage(
                `<strong>${data.total} produto(s) encontrado(s)</strong><br>
             Revise os dados abaixo e confirme a importação`,
                'success'
            );

            document
                .getElementById(
                    'previewContainer'
                )
                .classList.remove('hidden');
        })

        .catch(error => {

            console.error(
                'Erro:',
                error
            );

            showStatusMessage(
                'Erro ao processar arquivo: ' +
                error.message,
                'error'
            );
        });
}

function realizarImportacao(file) {

    const formData =
        new FormData();

    formData.append(
        'file',
        file
    );

    showStatusMessage(
        'Importando produtos...',
        'info'
    );

    const confirmBtn =
        document.getElementById(
            'confirmImportBtn'
        );

    if (confirmBtn) {
        confirmBtn.disabled = true;
    }

    fetch(
        'http://localhost:8080/produtos/importar',
        {
            method: 'POST',
            body: formData
        }
    )

        .then(response => response.json())

        .then(data => {

            if (
                data.sucesso ||
                data.totalImportado !== undefined
            ) {

                const total =
                    data.totalImportado ?? 'vários';

                showStatusMessage(
                    `<strong>Importação concluída!</strong><br>
                 ${total} produto(s) importado(s) com sucesso.`,
                    'success'
                );

                document
                    .getElementById(
                        'arquivoExcel'
                    )
                    .value = '';

                document
                    .getElementById(
                        'previewContainer'
                    )
                    .classList.add('hidden');

                setTimeout(
                    loadProductsFromAPI,
                    500
                );

            } else {

                showStatusMessage(
                    'Erro: ' +
                    (data.erro || 'Falha ao importar'),
                    'error'
                );
            }
        })

        .catch(error => {

            console.error(
                'Erro:',
                error
            );

            showStatusMessage(
                'Erro ao importar: ' +
                error.message,
                'error'
            );
        })

        .finally(() => {

            if (confirmBtn) {
                confirmBtn.disabled = false;
            }
        });
}

// ==========================================================
// PRÉ-VISUALIZAÇÃO DO EXCEL
// ==========================================================

function displayPreviewTable(produtos) {

    const table =
        document.getElementById(
            'previewTable'
        );

    if (!table) {
        return;
    }

    const thead =
        table.querySelector(
            'thead tr'
        );

    const tbody =
        table.querySelector(
            'tbody'
        );

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (
        !produtos ||
        produtos.length === 0
    ) {

        showStatusMessage(
            'Nenhum produto encontrado no arquivo',
            'warning'
        );

        return;
    }

    const headers = [
        'Código',
        'Descrição',
        'Quantidade',
        'Valor'
    ];

    headers.forEach(header => {

        const th =
            document.createElement('th');

        th.textContent = header;

        th.className =
            'px-6 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100';

        thead.appendChild(th);
    });

    produtos.forEach((produto, index) => {

        const tr =
            document.createElement('tr');

        tr.className =
            index % 2 === 0
                ? 'bg-white hover:bg-gray-50'
                : 'bg-gray-50 hover:bg-white';

        const codigoTd =
            document.createElement('td');

        codigoTd.textContent =
            produto.codigo ?? '';

        codigoTd.className =
            'px-6 py-4 text-sm text-gray-900';

        tr.appendChild(codigoTd);

        const descricaoTd =
            document.createElement('td');

        descricaoTd.textContent =
            produto.descricao ?? '';

        descricaoTd.className =
            'px-6 py-4 text-sm text-gray-900';

        tr.appendChild(descricaoTd);

        const quantidadeTd =
            document.createElement('td');

        quantidadeTd.textContent =
            produto.quantidade ?? 0;

        quantidadeTd.className =
            'px-6 py-4 text-sm text-gray-900 font-semibold';

        tr.appendChild(quantidadeTd);

        const valorTd =
            document.createElement('td');

        const valor =
            Number(produto.valor) || 0;

        valorTd.textContent =
            'R$ ' +
            valor.toLocaleString(
                'pt-BR',
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

        valorTd.className =
            'px-6 py-4 text-sm text-gray-900 font-semibold';

        tr.appendChild(valorTd);

        tbody.appendChild(tr);
    });
}

// ==========================================================
// MENSAGENS
// ==========================================================

function showStatusMessage(
    message,
    type
) {

    const container =
        document.getElementById(
            'statusMessage'
        );

    if (!container) {
        return;
    }

    if (!message) {

        container.classList.add(
            'hidden'
        );

        return;
    }

    let bgColor =
        'bg-blue-50 border-blue-200 text-blue-800';

    let icon =
        'fa-info-circle';

    if (type === 'success') {

        bgColor =
            'bg-green-50 border-green-200 text-green-800';

        icon =
            'fa-check-circle';

    } else if (type === 'error') {

        bgColor =
            'bg-red-50 border-red-200 text-red-800';

        icon =
            'fa-exclamation-circle';

    } else if (type === 'warning') {

        bgColor =
            'bg-yellow-50 border-yellow-200 text-yellow-800';

        icon =
            'fa-exclamation-triangle';
    }

    container.className =
        `${bgColor} border rounded-lg p-4 flex items-start gap-3`;

    container.innerHTML = `
        <i class="fas ${icon} text-xl flex-shrink-0 mt-0.5"></i>
        <div class="flex-grow">${message}</div>
    `;

    container.classList.remove('hidden');
}

