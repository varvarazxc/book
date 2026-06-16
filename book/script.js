// ----- Утилиты -----
function getUsers() {
  return JSON.parse(localStorage.getItem('bookclub_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('bookclub_users', JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('bookclub_currentUser') || null;
}

function setCurrentUser(username) {
  if (username) {
    localStorage.setItem('bookclub_currentUser', username);
  } else {
    localStorage.removeItem('bookclub_currentUser');
  }
}

function getBooks() {
  return JSON.parse(localStorage.getItem('bookclub_books')) || [];
}

function saveBooks(books) {
  localStorage.setItem('bookclub_books', JSON.stringify(books));
}

// ----- Данные -----
let currentUser = getCurrentUser();
let books = getBooks();
let filteredBooks = [...books];

// ----- DOM -----
const authSection = document.getElementById('auth-section');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');

const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

const regUsername = document.getElementById('reg-username');
const regPassword = document.getElementById('reg-password');
const registerBtn = document.getElementById('register-btn');

const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const bookTitle = document.getElementById('book-title');
const bookAuthor = document.getElementById('book-author');
const bookGenre = document.getElementById('book-genre');
const bookRating = document.getElementById('book-rating');
const bookReview = document.getElementById('book-review');
const addBookBtn = document.getElementById('add-book-btn');

const searchBook = document.getElementById('search-book');
const filterGenre = document.getElementById('filter-genre');
const filterBtn = document.getElementById('filter-btn');
const resetFilterBtn = document.getElementById('reset-filter-btn');

const booksList = document.getElementById('books-list');
const totalBooks = document.getElementById('total-books');
const avgRating = document.getElementById('avg-rating');
const favoriteGenre = document.getElementById('favorite-genre');

// ----- Проверка наличия элементов -----
console.log('DOM загружен');
console.log('registerBtn:', registerBtn);
console.log('loginBtn:', loginBtn);

// ----- Переключение форм -----
if (showRegisterLink) {
  showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Показываем форму регистрации');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });
}

if (showLoginLink) {
  showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Показываем форму входа');
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
}

// ----- Регистрация -----
if (registerBtn) {
  registerBtn.addEventListener('click', function() {
    console.log('Кнопка регистрации нажата');
    const username = regUsername.value.trim();
    const password = regPassword.value.trim();
    
    console.log('Имя:', username);
    console.log('Пароль:', password);
    
    if (!username || !password) {
      alert('Заполните все поля');
      return;
    }
    
    const users = getUsers();
    console.log('Существующие пользователи:', users);
    
    if (users.find(u => u.username === username)) {
      alert('Пользователь уже существует');
      return;
    }
    
    users.push({ username, password });
    saveUsers(users);
    alert('Регистрация успешна! Теперь войдите.');
    
    // Переключаем на форму входа
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    
    // Очищаем поля
    regUsername.value = '';
    regPassword.value = '';
  });
}

// ----- Вход -----
if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    console.log('Кнопка входа нажата');
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    
    if (!username || !password) {
      alert('Введите имя и пароль');
      return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      alert('Неверное имя или пароль');
      return;
    }
    
    currentUser = username;
    setCurrentUser(username);
    renderApp();
  });
}

// ----- Выход -----
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    setCurrentUser(null);
    currentUser = null;
    renderApp();
  });
}

// ----- Добавление книги -----
if (addBookBtn) {
  addBookBtn.addEventListener('click', function() {
    if (!currentUser) {
      alert('Сначала войдите в систему');
      return;
    }
    
    const title = bookTitle.value.trim();
    const author = bookAuthor.value.trim();
    const genre = bookGenre.value;
    const rating = parseInt(bookRating.value);
    const review = bookReview.value.trim();

    if (!title || !author) {
      alert('Название и автор обязательны');
      return;
    }

    const newBook = {
      id: Date.now(),
      title,
      author,
      genre,
      rating,
      review: review || 'Без рецензии',
      addedBy: currentUser,
      createdAt: new Date().toLocaleString()
    };

    books.push(newBook);
    saveBooks(books);
    filteredBooks = [...books];
    
    bookTitle.value = '';
    bookAuthor.value = '';
    bookReview.value = '';
    
    renderBooks();
    updateStats();
  });
}

// ----- Фильтрация -----
function applyFilter() {
  const search = searchBook.value.trim().toLowerCase();
  const genre = filterGenre.value;

  filteredBooks = books.filter(book => {
    const matchSearch = book.title.toLowerCase().includes(search) || 
                       book.author.toLowerCase().includes(search);
    const matchGenre = genre === 'all' || book.genre === genre;
    return matchSearch && matchGenre;
  });

  renderBooks();
}

if (filterBtn) {
  filterBtn.addEventListener('click', applyFilter);
}

if (resetFilterBtn) {
  resetFilterBtn.addEventListener('click', function() {
    searchBook.value = '';
    filterGenre.value = 'all';
    filteredBooks = [...books];
    renderBooks();
  });
}

// Поиск в реальном времени
if (searchBook) {
  searchBook.addEventListener('input', applyFilter);
}

if (filterGenre) {
  filterGenre.addEventListener('change', applyFilter);
}

// ----- Удаление -----
function deleteBook(id) {
  if (!confirm('Удалить книгу?')) return;
  books = books.filter(book => book.id !== id);
  saveBooks(books);
  filteredBooks = filteredBooks.filter(book => book.id !== id);
  renderBooks();
  updateStats();
}

// ----- Статистика -----
function updateStats() {
  const total = books.length;
  totalBooks.textContent = total;

  if (total === 0) {
    avgRating.textContent = '0';
    favoriteGenre.textContent = '-';
    return;
  }

  const avg = (books.reduce((sum, b) => sum + b.rating, 0) / total).toFixed(1);
  avgRating.textContent = avg;

  // Самый популярный жанр
  const genreCount = {};
  books.forEach(b => {
    genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
  });
  let maxCount = 0;
  let favGenre = '-';
  for (const [genre, count] of Object.entries(genreCount)) {
    if (count > maxCount) {
      maxCount = count;
      favGenre = genre;
    }
  }
  favoriteGenre.textContent = favGenre;
}

// ----- Рендер книг -----
function renderBooks() {
  if (filteredBooks.length === 0) {
    booksList.innerHTML = '<div class="empty">📖 Пока нет книг. Добавьте первую!</div>';
    return;
  }

  booksList.innerHTML = filteredBooks.map(book => `
    <div class="book-card">
      ${book.addedBy === currentUser ? `<button class="delete-btn" data-id="${book.id}">🗑 Удалить</button>` : ''}
      <h3>📕 ${escapeHtml(book.title)}</h3>
      <div class="author">✍️ ${escapeHtml(book.author)}</div>
      <div class="genre">${escapeHtml(book.genre)}</div>
      <div class="rating">${'⭐'.repeat(book.rating)} ${book.rating}/5</div>
      <div class="review">💬 ${escapeHtml(book.review)}</div>
      <div class="meta">👤 ${escapeHtml(book.addedBy)} · ${book.createdAt}</div>
    </div>
  `).join('');

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const id = Number(this.dataset.id);
      deleteBook(id);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ----- Общий рендер -----
function renderApp() {
  console.log('renderApp вызван, currentUser:', currentUser);
  
  if (currentUser) {
    authSection.style.display = 'none';
    mainContent.style.display = 'block';
    userGreeting.textContent = `👋 Здравствуйте, ${currentUser}`;
    logoutBtn.style.display = 'inline-block';
    
    books = getBooks();
    filteredBooks = [...books];
    renderBooks();
    updateStats();
  } else {
    authSection.style.display = 'block';
    mainContent.style.display = 'none';
    userGreeting.textContent = '';
    logoutBtn.style.display = 'none';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  }
}

// ----- Запуск приложения -----
console.log('Приложение запускается...');
renderApp();