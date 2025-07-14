const http = require('http');
const url = require('url');

// Dummy in-memory array to store todos
let todos = [
  { id: 1, text: 'First todo' }
];


// Helper: parse request body
function parseRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(data);
    } catch {
      callback({});
    }
  });
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;
  const parts = path.split('/').filter(Boolean); // ['todos', '1'] etc.

  res.setHeader('Content-Type', 'application/json');

  // GET /todos - show all todos
  if (method === 'GET' && path === '/todos') {
    res.writeHead(200);
    res.end(JSON.stringify(todos));
  }

  // POST /todos - add new todo
  else if (method === 'POST' && path === '/todos') {
    parseRequestBody(req, data => {
      const newTodo = {
        id: todos.length + 1,
        text: data.text || 'Untitled'
      };
      todos.push(newTodo);
      res.writeHead(201);
      res.end(JSON.stringify(newTodo));
    });
  }

  // PUT /todos/:id - edit todo
  else if (method === 'PUT' && parts[0] === 'todos' && parts[1]) {
    const id = parseInt(parts[1]);
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: 'Todo not found' }));
    }

    parseRequestBody(req, data => {
      todo.text = data.text || todo.text;
      res.writeHead(200);
      res.end(JSON.stringify(todo));
    });
  }

  // DELETE /todos/:id - delete todo
  else if (method === 'DELETE' && parts[0] === 'todos' && parts[1]) {
    const id = parseInt(parts[1]);
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: 'Todo not found' }));
    }

    todos.splice(index, 1);
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Todo deleted' }));
  }

  // Route not found
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
