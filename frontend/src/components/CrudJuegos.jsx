import React, { useState } from 'react';
import '../styles/CrudJuegos.css';

export default function CrudJuegos({ juegos, setJuegos, plataformas, setPlataformas, fondoActivo, setFondoActivo, volumenSonido, setVolumenSonido, onClose }) {
  const [modo, setModo] = useState('apariencia'); // 'juegos', 'plataformas', o 'apariencia'

  // -- THEME STATE MANAGEMENT --
  const [temaActivo, setTemaActivo] = useState(() => {
    return localStorage.getItem('biblioteca-theme') || document.documentElement.getAttribute('data-theme') || 'default';
  });

  const cambiarTema = (tema) => {
    setTemaActivo(tema);
    localStorage.setItem('biblioteca-theme', tema);
    if (tema === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', tema);
    }
  };

  // -- GAMES ENTITY STATE --
  const [juegoEditando, setJuegoEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    id: '',
    titulo: '',
    rutaImagen: '',
    inspiracion: '',
    consola: plataformas[0]?.id || 'ps2'
  });

  // -- PLATFORMS ENTITY STATE --
  const [platEditando, setPlatEditando] = useState(null);
  const [formPlat, setFormPlat] = useState({ id: '', nombre: '' });

  // -------------------------
  // GAME CRUD OPERATIONS
  // -------------------------
  const manejarCambioJuego = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const manejarSubidaImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario((prev) => ({
          ...prev,
          rutaImagen: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarJuego = () => {
    if (!formulario.titulo || !formulario.rutaImagen) return;

    if (juegoEditando !== null) {
      const nuevosJuegos = juegos.map(j => j.id === formulario.id ? formulario : j);
      setJuegos(nuevosJuegos);
    } else {
      const nuevoId = 'juego-' + Date.now();
      setJuegos([...juegos, { ...formulario, id: nuevoId }]);
    }
    cancelarEdicionJuego();
  };

  const editarJuego = (juego) => {
    setJuegoEditando(juego.id);
    let consola = juego.consola;
    if (!consola) {
      // Fallback: extract legacy platform identifier from image path
      const nombreArchivo = juego.rutaImagen.split('/').pop();
      consola = nombreArchivo.split('_')[0];
    }
    setFormulario({ ...juego, consola });
  };

  const eliminarJuego = (id) => {
    setJuegos(juegos.filter(j => j.id !== id));
  };

  const cancelarEdicionJuego = () => {
    setJuegoEditando(null);
    setFormulario({
      id: '',
      titulo: '',
      rutaImagen: '',
      inspiracion: '',
      consola: formulario.consola // Retain current selection in creation mode
    });
  };

  // -------------------------
  // PLATFORM CRUD OPERATIONS
  // -------------------------
  const manejarCambioPlat = (e) => {
    setFormPlat({ ...formPlat, [e.target.name]: e.target.value });
  };

  const guardarPlataforma = () => {
    if (!formPlat.id || !formPlat.nombre) return;

    const idNormalizado = formPlat.id.toLowerCase().replace(/\s+/g, '-');
    const formPlatFinal = { ...formPlat, id: idNormalizado };

    if (platEditando !== null) {
      const nuevasPlats = plataformas.map(p => p.id === platEditando ? formPlatFinal : p);
      setPlataformas(nuevasPlats);
    } else {
      // Evitar duplicados
      if (!plataformas.find(p => p.id === idNormalizado)) {
        setPlataformas([...plataformas, formPlatFinal]);
      }
    }
    cancelarEdicionPlat();
  };

  const editarPlataforma = (plat) => {
    setPlatEditando(plat.id);
    setFormPlat(plat);
  };

  const eliminarPlataforma = (id) => {
    setPlataformas(plataformas.filter(p => p.id !== id));
    // Si la consola del formulario actual fue eliminada, cambiar a la primera
    if (formulario.consola === id && plataformas.length > 0) {
      setFormulario({ ...formulario, consola: plataformas[0].id });
    }
  };

  const cancelarEdicionPlat = () => {
    setPlatEditando(null);
    setFormPlat({ id: '', nombre: '' });
  };

  const seleccionarConsolaLateral = (id) => {
    setModo('juegos');
    setFormulario({ ...formulario, consola: id });
    cancelarEdicionJuego();
  };

  const plataformaActivaInfo = plataformas.find(p => p.id === formulario.consola);

  // Filtrar juegos para mostrar en la lista inferior (opcional: solo los de esta plataforma, o todos. Dejamos todos para facilitar)
  const juegosDeConsolaActiva = juegos.filter(j => {
    let jConsola = j.consola;
    if (!jConsola) {
      const nombreArchivo = j.rutaImagen.split('/').pop();
      jConsola = nombreArchivo.split('_')[0];
    }
    return jConsola === formulario.consola;
  });

  return (
    <div className="crud-overlay">
      <div className="crud-modal">
        <button className="crud-close" onClick={onClose}>✕</button>

        <h2 className="settings-main-title">Ajustes</h2>

        {/* PESTAÑAS (TABS) */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${modo === 'apariencia' ? 'active' : ''}`}
            onClick={() => setModo('apariencia')}
          >
            🎨 Apariencia
          </button>
          <button
            className={`settings-tab ${modo === 'juegos' ? 'active' : ''}`}
            onClick={() => setModo('juegos')}
          >
            🕹️ Juegos
          </button>
          <button
            className={`settings-tab ${modo === 'plataformas' ? 'active' : ''}`}
            onClick={() => setModo('plataformas')}
          >
            🎮 Plataformas
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="crud-main full-width">
          {modo === 'apariencia' && (
            <div className="settings-section">
              <h3 className="crud-title">Personalización Visual</h3>
              <p style={{ color: '#94a3b8', marginTop: '10px', marginBottom: '25px' }}>
                Selecciona el tema de color y estilo para toda la biblioteca.
              </p>

              <div className="theme-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                <button
                  className={`theme-card-btn ${temaActivo === 'default' ? 'active' : ''}`}
                  onClick={() => cambiarTema('default')}
                >
                  <div className="theme-color-circle" style={{ background: '#38bdf8', color: '#38bdf8' }}></div>
                  <span>Neón Azul</span>
                </button>
                <button
                  className={`theme-card-btn ${temaActivo === 'matrix' ? 'active' : ''}`}
                  onClick={() => cambiarTema('matrix')}
                >
                  <div className="theme-color-circle" style={{ background: '#22c55e', color: '#22c55e' }}></div>
                  <span>Matrix Verde</span>
                </button>
                <button
                  className={`theme-card-btn ${temaActivo === 'sunset' ? 'active' : ''}`}
                  onClick={() => cambiarTema('sunset')}
                >
                  <div className="theme-color-circle" style={{ background: '#f97316', color: '#f97316' }}></div>
                  <span>Atardecer Naranja</span>
                </button>
                <button
                  className={`theme-card-btn ${temaActivo === 'cyberpunk' ? 'active' : ''}`}
                  onClick={() => cambiarTema('cyberpunk')}
                >
                  <div className="theme-color-circle" style={{ background: '#d946ef', color: '#d946ef' }}></div>
                  <span>Cyberpunk Rosa</span>
                </button>
                <button
                  className={`theme-card-btn ${temaActivo === 'light' ? 'active' : ''}`}
                  onClick={() => cambiarTema('light')}
                >
                  <div className="theme-color-circle" style={{ background: '#e2e8f0', color: '#e2e8f0' }}></div>
                  <span>Blanco (Light)</span>
                </button>
                <button
                  className={`theme-card-btn ${temaActivo === 'dark' ? 'active' : ''}`}
                  onClick={() => cambiarTema('dark')}
                >
                  <div className="theme-color-circle" style={{ background: '#09090b', color: '#09090b' }}></div>
                  <span>Negro (Dark)</span>
                </button>
              </div>

              <h3 className="crud-title" style={{ marginTop: '40px' }}>Imagen de Fondo</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px', marginBottom: '25px' }}>
                Selecciona una imagen de fondo para la interfaz principal.
              </p>

              <div className="crud-form" style={{ background: 'transparent', padding: '0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <select
                    className="crud-input"
                    value={fondoActivo}
                    onChange={(e) => setFondoActivo(e.target.value)}
                    style={{ flex: 1, cursor: 'pointer' }}
                  >
                    <option value="none">Ninguno (Tema puro)</option>
                    <option value="enderman">Enderman</option>
                    <option value="ghosts">Ghosts</option>
                    <option value="gtavi">GTA VI</option>
                    <option value="los_santos">Los Santos</option>
                    <option value="tech_cat">Tech Cat</option>
                    <option value="thinkpad">Thinkpad</option>
                    <option value="undertale">Undertale</option>
                  </select>
                  <button
                    className={`theme-card-btn ${fondoActivo === 'none' ? 'active' : ''}`}
                    onClick={() => setFondoActivo('none')}
                    style={{ padding: '12px 15px', flexDirection: 'row', gap: '5px' }}
                  >
                    <span className="theme-icon" style={{ fontSize: '1.2rem', marginBottom: '0' }}>🚫</span>
                    <span>Quitar Fondo</span>
                  </button>
                </div>
              </div>

              <h3 className="crud-title" style={{ marginTop: '40px' }}>Ajustes de Sonido</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px', marginBottom: '25px' }}>
                Ajusta el volumen de los efectos de sonido de la interfaz.
              </p>

              <div className="crud-form" style={{ background: 'transparent', padding: '0' }}>
                <label style={{ display: 'block', color: 'var(--text-main)', marginBottom: '10px', fontWeight: '500' }}>
                  Volumen: {Math.round(volumenSonido * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumenSonido}
                  onChange={(e) => setVolumenSonido(parseFloat(e.target.value))}
                  style={{ width: '300px', maxWidth: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                />
              </div>
            </div>
          )}

          {modo === 'juegos' && (
            <div className="settings-section">
              <h3 className="crud-title">Gestión de Biblioteca</h3>

              <div className="crud-form">
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Plataforma Seleccionada:</label>
                  <select
                    value={formulario.consola}
                    onChange={(e) => {
                      setFormulario({ ...formulario, consola: e.target.value });
                      cancelarEdicionJuego();
                    }}
                    className="crud-input"
                  >
                    {plataformas.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  name="titulo"
                  placeholder="Título del juego"
                  value={formulario.titulo}
                  onChange={manejarCambioJuego}
                  className="crud-input"
                />

                <div className="crud-file-wrapper">
                  <label className="crud-file-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarSubidaImagen}
                      className="crud-file-input"
                    />
                    <span className="crud-file-btn">📁 Subir Imagen de Portada</span>
                  </label>
                  {formulario.rutaImagen && (
                    <img src={formulario.rutaImagen} alt="Preview" className="crud-image-preview" />
                  )}
                </div>

                <textarea
                  name="inspiracion"
                  placeholder="Inspiración / Descripción"
                  value={formulario.inspiracion}
                  onChange={manejarCambioJuego}
                  className="crud-textarea"
                />

                <div className="crud-form-actions">
                  <button className="btn-guardar" onClick={guardarJuego}>
                    {juegoEditando ? 'Guardar Cambios' : 'Añadir Juego'}
                  </button>
                  {juegoEditando && (
                    <button className="btn-cancelar" onClick={cancelarEdicionJuego}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="crud-list-container">
                <h3>Juegos de {plataformaActivaInfo?.nombre || 'esta plataforma'}</h3>
                <div className="crud-list">
                  {juegosDeConsolaActiva.map(juego => (
                    <div key={juego.id} className="crud-list-item">
                      <img src={juego.rutaImagen} alt={juego.titulo} className="crud-item-img" />
                      <div className="crud-item-info">
                        <h4>{juego.titulo}</h4>
                        <p className="crud-item-desc">{juego.inspiracion || 'Sin descripción añadida.'}</p>
                      </div>
                      <div className="crud-list-actions">
                        <button className="btn-editar" onClick={() => editarJuego(juego)}>Editar</button>
                        <button className="btn-eliminar" onClick={() => eliminarJuego(juego.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                  {juegosDeConsolaActiva.length === 0 && (
                    <p className="crud-empty">No hay juegos aquí.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {modo === 'plataformas' && (
            <div className="settings-section">
              <h3 className="crud-title">Gestión de Plataformas</h3>

              <div className="crud-form">
                <h3>{platEditando ? 'Editar Plataforma' : 'Añadir Nueva Plataforma'}</h3>

                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre de la Plataforma (ej: Nintendo Switch)"
                  value={formPlat.nombre}
                  onChange={manejarCambioPlat}
                  className="crud-input"
                />

                <input
                  type="text"
                  name="id"
                  placeholder="ID interno (ej: switch) - Sin espacios"
                  value={formPlat.id}
                  onChange={manejarCambioPlat}
                  className="crud-input"
                  disabled={platEditando !== null}
                />

                <div className="crud-form-actions">
                  <button className="btn-guardar" onClick={guardarPlataforma}>
                    {platEditando ? 'Guardar Cambios' : 'Añadir Plataforma'}
                  </button>
                  {platEditando && (
                    <button className="btn-cancelar" onClick={cancelarEdicionPlat}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="crud-list-container">
                <h3>Plataformas Existentes</h3>
                <div className="crud-list">
                  {plataformas.map(plat => (
                    <div key={plat.id} className="crud-list-item">
                      <div className="crud-item-info">
                        <h4>{plat.nombre} <span className="plat-id-badge">({plat.id})</span></h4>
                      </div>
                      <div className="crud-list-actions">
                        <button className="btn-editar" onClick={() => editarPlataforma(plat)}>Editar</button>
                        <button className="btn-eliminar" onClick={() => eliminarPlataforma(plat.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
