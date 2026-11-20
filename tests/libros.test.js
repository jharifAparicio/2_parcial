const request = require('supertest');
const createApp = require('../src/app');

describe('API Catálogo de Libros', () => {
  let mockDb;
  let app;

  beforeEach(() => {
    const datos = [
      { id: 1, titulo: 'Clean Code', autor: 'Robert C. Martin', anio_publicacion: 2008 }
    ];

    mockDb = {
      listarLibros: jest.fn(async () => datos),
      obtenerLibroPorId: jest.fn(async (id) => datos.find((l) => l.id === Number(id)) || null),
      crearLibro: jest.fn(async (libro) => {
        const nuevo = { id: datos.length + 1, ...libro };
        datos.push(nuevo);
        return nuevo;
      }),
      actualizarLibro: jest.fn(),
      eliminarLibro: jest.fn()
    };

    app = createApp(mockDb);
  });

  test('GET /health devuelve 200 y estado activo', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /libros crea un libro válido y devuelve 201', async () => {
    const res = await request(app).post('/libros').send({
      titulo: 'The Pragmatic Programmer',
      autor: 'Andrew Hunt',
      anio_publicacion: 1999
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 2);
    expect(res.body.titulo).toBe('The Pragmatic Programmer');
  });

  test('POST /libros rechaza datos inválidos con 400', async () => {
    const res = await request(app).post('/libros').send({
      titulo: '',
      autor: 'Autor',
      anio_publicacion: 'no-es-entero'
    });
    expect(res.statusCode).toBe(400);
  });

  test('GET /libros/:id devuelve 404 si el libro no existe', async () => {
    const res = await request(app).get('/libros/999');
    expect(res.statusCode).toBe(404);
  });
});
