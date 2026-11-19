const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = {
  async listarLibros() {
    const [rows] = await pool.query('SELECT id, titulo, autor, anio_publicacion FROM libros');
    return rows;
  },
  async obtenerLibroPorId(id) {
    const [rows] = await pool.query(
      'SELECT id, titulo, autor, anio_publicacion FROM libros WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },
  async crearLibro({ titulo, autor, anio_publicacion }) {
    const [result] = await pool.query(
      'INSERT INTO libros (titulo, autor, anio_publicacion) VALUES (?, ?, ?)',
      [titulo, autor, anio_publicacion]
    );
    return { id: result.insertId, titulo, autor, anio_publicacion };
  },
  async actualizarLibro(id, { titulo, autor, anio_publicacion }) {
    const [result] = await pool.query(
      'UPDATE libros SET titulo = ?, autor = ?, anio_publicacion = ? WHERE id = ?',
      [titulo, autor, anio_publicacion, id]
    );
    if (result.affectedRows === 0) return null;
    return { id: Number(id), titulo, autor, anio_publicacion };
  },
  async eliminarLibro(id) {
    const [result] = await pool.query('DELETE FROM libros WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};
