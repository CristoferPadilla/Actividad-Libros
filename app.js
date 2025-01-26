const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const paginationDiv = document.getElementById("myPager");

let currentPage = 1; 
const resultsPerPage = 12; 

// Evento para manejar la búsqueda
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    currentPage = 1;
    await fetchBooks(query);
    searchInput.value = ""; 
});

// Función para buscar libros
async function fetchBooks(query) {
    const searchType = document.querySelector('input[name="search-type"]:checked').value; 
    let url;

    if (searchType === "title") {
        url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&page=${currentPage}`;
    } else if (searchType === "editorial") {
        url = `https://openlibrary.org/search.json?publisher=${encodeURIComponent(query)}&page=${currentPage}`;
    } else if (searchType === "author") {
        url = `https://openlibrary.org/search.json?author=${encodeURIComponent(query)}&page=${currentPage}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        const startIndex = (currentPage - 1) * resultsPerPage;
        const paginatedBooks = data.docs.slice(startIndex, startIndex + resultsPerPage);
        displayResults(paginatedBooks);
        setupPagination(data.numFound, query); 
    } catch (error) {
        resultsDiv.innerHTML = `<p class="text-red-500">Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>`;
        console.error(error);
    }
}


function displayResults(books) {
    resultsDiv.innerHTML = ""; 
    if (books.length === 0) {
        resultsDiv.innerHTML = `<p class="text-gray-500">No se encontraron libros.</p>`;
        return;
    }

    const resultsRow = document.createElement("div");
    resultsRow.classList.add("grid", "grid-cols-1", "sm:grid-cols-2", "md:grid-cols-3", "lg:grid-cols-4", "gap-6");

    books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book", "bg-white", "p-4", "border", "border-gray-200", "rounded-lg", "shadow-md", "hover:shadow-lg", "transition-shadow", "duration-300");

        const coverImage = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/128x193?text=No+Image";

        const authorNames = book.author_name && book.author_name.length > 0 ? book.author_name.join(", ") : "Desconocido";
        const publishYear = book.first_publish_year || "Desconocido";

        bookElement.innerHTML = `
            <div class="book-cover mb-4">
                <img src="${coverImage}" alt="no image" class="w-full h-48 object-cover rounded" />
            </div>
            <div class="book-info">
                <h2 class="text-lg font-semibold mb-2">${book.title}</h2>
                <p class="text-gray-600 mb-1">Autor: ${authorNames}</p>
                <p class="text-gray-600">Año de publicación: ${publishYear}</p>
            </div>
        `;
        resultsRow.appendChild(bookElement);
    });

    resultsDiv.appendChild(resultsRow);
}

// Función para configurar la paginación
function setupPagination(totalResults, query) {
    paginationDiv.innerHTML = ""; 
    const totalPages = Math.min(Math.ceil(totalResults / resultsPerPage), 4); 

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("li");
        pageLink.classList.add("inline-block", "mx-1");

        pageLink.innerHTML = `<a href="#" data-page="${i}" class="px-3 py-1 border border-gray-300 rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}">${i}</a>`;
        
        pageLink.addEventListener("click", async (e) => {
            e.preventDefault();
            currentPage = i;
            await fetchBooks(query); 
        });

        paginationDiv.appendChild(pageLink);
    }
}
