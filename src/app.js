const express = require('express');

function validarLibro(body) {
  const { titulo, autor, anio_publicacion } = body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return 'El titulo es obligatorio y no debe estar vacío.';
  }
  if (typeof autor !== 'string' || autor.trim() === '') {
    return 'El autor es obligatorio y no debe estar vacío.';
  }
  if (!Number.isInteger(anio_publicacion)) {
    return 'El anio_publicacion debe ser un número entero válido.';
  }
  return null;
}

function createApp(dbRepository) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      servicio: 'api-catalogo-libros',
      version: process.env.APP_VERSION || '1.0.0'
    });
  });

  app.get('/libros', async (req, res) => {
    try {
      const libros = await dbRepository.listarLibros();
      res.status(200).json(libros);
    } catch (error) {
      res.status(500).json({ error: 'Error al consultar los libros' });
    }
  });

  app.get('/libros/:id', async (req, res) => {
    try {
      const libro = await dbRepository.obtenerLibroPorId(req.params.id);
      if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json(libro);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el libro' });
    }
  });

  app.post('/libros', async (req, res) => {
    const errorValidacion = validarLibro(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    try {
      const nuevo = await dbRepository.crearLibro({
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        anio_publicacion: req.body.anio_publicacion
      });
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el libro' });
    }
  });

  app.put('/libros/:id', async (req, res) => {
    const errorValidacion = validarLibro(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    try {
      const actualizado = await dbRepository.actualizarLibro(req.params.id, {
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        anio_publicacion: req.body.anio_publicacion
      });
      if (!actualizado) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json(actualizado);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el libro' });
    }
  });

  app.delete('/libros/:id', async (req, res) => {
    try {
      const eliminado = await dbRepository.eliminarLibro(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json({ mensaje: 'Libro eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el libro' });
    }
  });

  return app;
}

module.exports = createApp;
