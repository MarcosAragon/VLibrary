import React, { useState, useEffect, useRef } from 'react';
import { misJuegos as juegosIniciales } from '../data/bibliotecaData';
import CrudJuegos from './CrudJuegos';

export default function CarruselJuegos() {
  const [juegos, setJuegos] = useState(juegosIniciales);

  // Synchronize internal state with external data source during development (HMR support)
  useEffect(() => {
    setJuegos(juegosIniciales);
  }, [juegosIniciales]);

  const [plataformas, setPlataformas] = useState([
    { id: 'ps1', nombre: 'PlayStation 1' },
    { id: 'ps2', nombre: 'PlayStation 2' },
    { id: 'ps3', nombre: 'PlayStation 3' },
    { id: 'ps4', nombre: 'PlayStation 4' },
    { id: 'xbox', nombre: 'Xbox' },
  ]);
  const [colecciones, setColecciones] = useState([
    { id: 'col-gta', nombre: 'Grand Theft Auto', imagen: 'Grand_Theft_Auto' }
  ]);
  const [plataformaActiva, setPlataformaActiva] = useState('TODOS');
  const [mostrarCrud, setMostrarCrud] = useState(false);
  const [mostrarAcercaDe, setMostrarAcercaDe] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [fondoActivo, setFondoActivo] = useState(() => localStorage.getItem('portfolio-bg') || 'none');
  const [volumenSonido, setVolumenSonido] = useState(() => parseFloat(localStorage.getItem('portfolio-volumen') || '0.5'));
  const [indexActivo, setIndexActivo] = useState(0);
  const [ordenTipo, setOrdenTipo] = useState('plataforma');
  const [esMovil, setEsMovil] = useState(false);

  const obtenerConsola = (juego) => {
    if (juego?.consola) return juego.consola;
    const ruta = juego?.rutaImagen || '';
    const nombreArchivo = ruta.split('/').pop();
    return nombreArchivo.split('_')[0];
  };

  const juegosFiltrados = React.useMemo(() => {
    if (plataformaActiva !== 'TODOS') {
      const esColeccion = colecciones.some(c => c.id === plataformaActiva);
      if (esColeccion) {
        return juegos.filter(j => j.coleccion === plataformaActiva);
      } else {
        return juegos.filter(j => obtenerConsola(j) === plataformaActiva);
      }
    }

    const copia = [...juegos];
    if (ordenTipo === 'alfabetico') {
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else {
      // Sort by platform first, then alphabetically within each platform
      return copia.sort((a, b) => {
        const consolaA = obtenerConsola(a);
        const consolaB = obtenerConsola(b);
        if (consolaA !== consolaB) {
          return consolaA.localeCompare(consolaB);
        }
        return a.titulo.localeCompare(b.titulo);
      });
    }
  }, [juegos, plataformaActiva, ordenTipo]);

  // Reset active index to bounds if filtered dataset shrinks
  useEffect(() => {
    if (juegosFiltrados.length > 0 && indexActivo >= juegosFiltrados.length) {
      setIndexActivo(juegosFiltrados.length - 1);
    }
  }, [juegosFiltrados.length, indexActivo]);

  // Reset active index when platform changes and manage audio playback state
  useEffect(() => {
    if (indexActivo !== 0) {
      ignorarSiguienteSonidoRef.current = true;
    }
    setIndexActivo(0);

    if (esPrimeraCargaPlataforma.current) {
      esPrimeraCargaPlataforma.current = false;
      return;
    }
    if (audioDownRef.current) {
      audioDownRef.current.currentTime = 0;
      audioDownRef.current.play().catch((err) => {
        console.warn('La reproducción automática del sonido falló:', err);
      });
    }
  }, [plataformaActiva]);

  const [cajaWidths, setCajaWidths] = useState({});
  const audioRef = useRef(null);
  const audioDownRef = useRef(null);
  const esPrimeraCarga = useRef(true);
  const esPrimeraCargaPlataforma = useRef(true);
  const ignorarSiguienteSonidoRef = useRef(false);
  const touchStartX = useRef(0);

  // Detect viewport width for responsive scaling adjustments (mobile vs desktop)
  useEffect(() => {
    const verificarResolucion = () => {
      setEsMovil(window.innerWidth <= 600);
    };
    verificarResolucion();
    window.addEventListener('resize', verificarResolucion);
    return () => window.removeEventListener('resize', verificarResolucion);
  }, []);

  // Pre-load audio assets into refs to minimize playback latency
  useEffect(() => {
    const audio = new Audio('/assets/sounds/move_up.mp3');
    audio.volume = volumenSonido;
    audioRef.current = audio;

    const audioDown = new Audio('/assets/sounds/move_down.mp3');
    audioDown.volume = volumenSonido;
    audioDownRef.current = audioDown;
  }, []);

  // Synchronize audio element volumes with state configuration
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumenSonido;
    }
    if (audioDownRef.current) {
      audioDownRef.current.volume = volumenSonido;
    }
  }, [volumenSonido]);

  // Trigger navigation sound effect upon active index mutation (with debounce logic)
  useEffect(() => {
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }

    if (ignorarSiguienteSonidoRef.current) {
      ignorarSiguienteSonidoRef.current = false;
      return;
    }

    if (audioRef.current && juegosFiltrados.length > 0) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn('Playback initialization failed due to browser constraints:', err);
      });
    }
  }, [indexActivo, juegosFiltrados.length]);

  // Extract aspect ratio from loaded image to dynamically calculate box widths
  const handleImageLoad = (juegoId, consola, event) => {
    const { naturalWidth, naturalHeight } = event.target;
    if (naturalHeight > 0) {
      const relacionAspecto = naturalWidth / naturalHeight;
      setCajaWidths((prev) => ({
        ...prev,
        [juegoId]: relacionAspecto,
      }));
    }
  };

  // Calcular ancho a partir de la relación de aspecto y la altura adaptada a móvil
  const obtenerScaledWidth = (idx) => {
    const juego = juegosFiltrados[idx];
    const consola = obtenerConsola(juego);
    if (!juego) return 0;

    // Altura del juego según pantalla (móvil vs desktop)
    const alturaActual = esMovil
      ? (consola === 'ps1' ? 130 : 150)
      : (consola === 'ps1' ? 210 : 240);

    // Relación de aspecto por defecto
    let ratioBase = 175 / 240;
    if (consola === 'ps1') ratioBase = 1.0;
    else if (consola === 'ps2') ratioBase = 170 / 240;
    else if (consola === 'ps3') ratioBase = 175 / 240;
    else if (consola === 'ps4') ratioBase = 180 / 240;

    const ratioReal = cajaWidths[juego.id] || ratioBase;
    const anchoReal = ratioReal * alturaActual;
    const escala = idx === indexActivo ? 1.2 : 0.85;
    return anchoReal * escala;
  };

  // Bind keyboard navigation arrows to carousel controls
  useEffect(() => {
    const manejarTeclado = (evento) => {
      // Evitar scroll en la página al usar flechas si es necesario
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evento.key)) {
        evento.preventDefault();
      }

      // Navegación de consolas (Arriba/Abajo)
      if (evento.key === 'ArrowUp' || evento.key === 'w' || evento.key === 'W') {
        const opciones = ['TODOS', ...plataformas.map(p => p.id), ...colecciones.map(c => c.id)];
        const index = opciones.indexOf(plataformaActiva);
        if (index > 0) {
          setPlataformaActiva(opciones[index - 1]);
        }
      }
      if (evento.key === 'ArrowDown' || evento.key === 's' || evento.key === 'S') {
        const opciones = ['TODOS', ...plataformas.map(p => p.id), ...colecciones.map(c => c.id)];
        const index = opciones.indexOf(plataformaActiva);
        if (index >= 0 && index < opciones.length - 1) {
          setPlataformaActiva(opciones[index + 1]);
        }
      }

      // Navegación de juegos (Izquierda/Derecha)
      if (juegosFiltrados.length === 0) return;
      if (evento.key === 'ArrowRight' || evento.key === 'd' || evento.key === 'D') {
        setIndexActivo((prev) => Math.min(prev + 1, juegosFiltrados.length - 1));
      }
      if (evento.key === 'ArrowLeft' || evento.key === 'a' || evento.key === 'A') {
        setIndexActivo((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [juegosFiltrados.length, plataformaActiva, plataformas]);

  // Intercept scroll wheel events to navigate carousel items
  const manejarScroll = (evento) => {
    // Si el menú está cerrado no hacemos nada
    if (!menuAbierto) return;

    // Evitamos el scroll nativo de la lista si queremos que controle la ruleta pura
    evento.preventDefault();

    const opciones = ['TODOS', ...plataformas.map(p => p.id), ...colecciones.map(c => c.id)];
    const index = opciones.indexOf(plataformaActiva);

    if (evento.deltaY > 0) {
      // Execute scroll lock and navigation transition
      if (index >= 0 && index < opciones.length - 1) {
        setPlataformaActiva(opciones[index + 1]);
      }
    } else if (evento.deltaY < 0) {
      // Scroll hacia arriba (anterior)
      if (index > 0) {
        setPlataformaActiva(opciones[index - 1]);
      }
    }
  };

  // Bind global wheel event listeners with non-passive configuration for preventDefault support
  const ruletaRef = useRef(null);
  useEffect(() => {
    const el = ruletaRef.current;
    if (el) {
      el.addEventListener('wheel', manejarScroll, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener('wheel', manejarScroll);
      }
    };
  }, [plataformaActiva, menuAbierto]);

  useEffect(() => {
    if (ruletaRef.current) {
      const elementoActivo = ruletaRef.current.querySelector('.active');
      if (elementoActivo) {
        const contenedor = ruletaRef.current;
        const offsetTop = elementoActivo.offsetTop;
        const mitadContenedor = contenedor.clientHeight / 2;
        const mitadElemento = elementoActivo.clientHeight / 2;

        contenedor.scrollTo({
          top: offsetTop - mitadContenedor + mitadElemento,
          behavior: 'smooth'
        });
      }
    }
  }, [plataformaActiva, menuAbierto]);

  // Capture touch coordinates for swipe gesture detection
  const manejarTouchStart = (evento) => {
    touchStartX.current = evento.touches[0].clientX;
  };

  const manejarTouchEnd = (evento) => {
    if (juegosFiltrados.length === 0) return;
    const touchEndX = evento.changedTouches[0].clientX;
    const diferencia = touchStartX.current - touchEndX;

    if (diferencia > 40) {
      // Swipe hacia la izquierda: avanza
      setIndexActivo((prev) => Math.min(prev + 1, juegosFiltrados.length - 1));
    } else if (diferencia < -40) {
      // Swipe hacia la derecha: retrocede
      setIndexActivo((prev) => Math.max(prev - 1, 0));
    }
  };

  // Compute dynamic transform offsets for 3D positional rendering
  const G = esMovil ? 20 : 30; // Base gap between items
  const posicionesX = [];
  posicionesX[indexActivo] = 0; // Active element is centered at origin

  // Compute absolute right positions
  for (let i = indexActivo + 1; i < juegosFiltrados.length; i++) {
    posicionesX[i] = posicionesX[i - 1] + (obtenerScaledWidth(i - 1) / 2) + G + (obtenerScaledWidth(i) / 2);
  }

  // Compute absolute left positions
  for (let i = indexActivo - 1; i >= 0; i--) {
    posicionesX[i] = posicionesX[i + 1] - (obtenerScaledWidth(i + 1) / 2) - G - (obtenerScaledWidth(i) / 2);
  }

  return (
    <div className="app-layout-main">
      {!mostrarCrud && !mostrarAcercaDe && (
        <div style={{ position: 'absolute', top: '35px', right: '35px', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 100 }}>
          {plataformaActiva === 'TODOS' && (
            <div className="orden-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ordenar por:</span>
              <select
                value={ordenTipo}
                onChange={(e) => setOrdenTipo(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--primary-color)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value="plataforma">Plataforma</option>
                <option value="alfabetico">Orden Alfabético</option>
              </select>
            </div>
          )}

          <button
            className="btn-global-settings"
            style={{ position: 'relative', top: '0', right: '0' }}
            onClick={() => setMostrarCrud(true)}
            title="Ajustes y Gestión"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      )}

      {!mostrarCrud && !mostrarAcercaDe && (
        <button
          className={`btn-floating-toggle ${menuAbierto ? 'abierto' : 'cerrado'}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
          title="Mostrar/Ocultar Menú"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {menuAbierto ? (
              <polyline points="15 18 9 12 15 6"></polyline> // Flecha Izquierda
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      )}

      <div className="app-bg-layer" style={{ backgroundImage: fondoActivo === 'none' ? 'none' : `url(/assets/background/background_${fondoActivo}.jpg)` }}></div>

      <div className={`main-sidebar-left ${menuAbierto ? 'abierto' : 'cerrado'}`}>
        <h2 className="main-sidebar-title">Plataformas</h2>
        <ul className="main-sidebar-list" ref={ruletaRef}>
          <li
            className={`ruleta-item ${plataformaActiva === 'TODOS' ? 'active' : ''}`}
            onClick={() => setPlataformaActiva('TODOS')}
          >
            <span>TODOS</span>
          </li>
          {plataformas.map(p => (
            <li
              key={p.id}
              className={`ruleta-item ${plataformaActiva === p.id ? 'active' : ''}`}
              onClick={() => setPlataformaActiva(p.id)}
            >
              <img
                src={`/assets/images/platforms/${p.id}.png`}
                alt={p.nombre}
                className="plat-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="plat-fallback" style={{ display: 'none' }}>{p.nombre}</span>
            </li>
          ))}
        </ul>

        <h2 className="main-sidebar-title" style={{ marginTop: '20px' }}>Colecciones</h2>
        <ul className="main-sidebar-list">
          {colecciones.map(c => (
            <li
              key={c.id}
              className={`ruleta-item ${plataformaActiva === c.id ? 'active' : ''}`}
              onClick={() => setPlataformaActiva(c.id)}
            >
              <img
                src={`/assets/images/platforms/collections/${c.imagen || c.id}.png`}
                alt={c.nombre}
                className="plat-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="plat-fallback" style={{ display: 'none' }}>{c.nombre}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="contenedor-carrusel-interactivo" style={{ flex: 1 }}>
        <div className="top-header-carrusel">
          {plataformaActiva === 'TODOS' ? (
            <h2>Todas las Plataformas</h2>
          ) : (
            (() => {
              const p = plataformas.find(plat => plat.id === plataformaActiva);
              const c = colecciones.find(col => col.id === plataformaActiva);
              const obj = p || c;
              if (!obj) return <h2>Desconocido</h2>;
              
              const isCollection = !!c;
              const imgPath = isCollection 
                ? `/assets/images/platforms/collections/${obj.imagen || obj.id}.png` 
                : `/assets/images/platforms/${obj.imagen || obj.id}.png`;
              
              return (
                <div className="header-plat-logo-container">
                  <img
                    src={imgPath}
                    alt={obj.nombre}
                    className="header-plat-logo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline-block';
                    }}
                  />
                  <h2 className="header-plat-fallback" style={{ display: 'none' }}>{obj.nombre}</h2>
                </div>
              );
            })()
          )}
        </div>

        {juegosFiltrados.length > 0 ? (
          <>
            <div
              className="carrusel-escena"
              onTouchStart={manejarTouchStart}
              onTouchEnd={manejarTouchEnd}
            >
              {juegosFiltrados.map((juego, index) => {
                const consola = obtenerConsola(juego);

                // Calculamos la distancia matemática al juego activo (0 = centro, -1 = izquierda, 1 = derecha, etc.)
                const distancia = index - indexActivo;

                // Determinamos la clase de posición para el z-index y opacidades base
                let estadoPosicion = "oculto";
                if (distancia === 0) estadoPosicion = "centro";
                else if (distancia === -1) estadoPosicion = "izquierda-1";
                else if (distancia === -2) estadoPosicion = "izquierda-2";
                else if (distancia === 1) estadoPosicion = "derecha-1";
                else if (distancia === 2) estadoPosicion = "derecha-2";

                // Usamos la posición X calculada equidistantemente
                let posicionX = posicionesX[index];
                let posicionZ = distancia === 0 ? (esMovil ? 100 : 160) : 0; // Menor profundidad en móvil
                let escala = distancia === 0 ? 1.2 : 0.85;
                let posicionY = distancia === 0 ? -15 : 0;

                const estiloDinamico = {
                  transform: `translate3d(${posicionX}px, ${posicionY}px, ${posicionZ}px) scale(${escala})`,
                  zIndex: 10 - Math.abs(distancia) // Los del centro siempre quedan arriba
                };

                return (
                  <div
                    key={juego.id}
                    className={`caja-juego ${consola} ${estadoPosicion}`}
                    style={estiloDinamico}
                    onClick={() => setIndexActivo(index)}
                  >
                    <div className="cara-frontal">
                        <img
                          src={juego.rutaImagen}
                          alt={juego.titulo}
                          onLoad={(evento) => handleImageLoad(juego.id, consola, evento)}
                        />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel-inspiracion">
              <h3>{juegosFiltrados[indexActivo]?.titulo}</h3>
              <p>{juegosFiltrados[indexActivo]?.inspiracion}</p>
            </div>
          </>
        ) : (
          <div style={{ color: '#94a3b8', padding: '50px', textAlign: 'center' }}>
            No hay juegos en esta plataforma. Abre las opciones para añadir uno.
          </div>
        )}

        {mostrarCrud && (
          <CrudJuegos
            juegos={juegos}
            setJuegos={setJuegos}
            plataformas={plataformas}
            setPlataformas={setPlataformas}
            fondoActivo={fondoActivo}
            setFondoActivo={(bg) => {
              setFondoActivo(bg);
              localStorage.setItem('portfolio-bg', bg);
            }}
            volumenSonido={volumenSonido}
            setVolumenSonido={(vol) => {
              setVolumenSonido(vol);
              localStorage.setItem('portfolio-volumen', vol.toString());
            }}
            onClose={() => setMostrarCrud(false)}
          />
        )}

      </div>

      {/* Botón y Modal Acerca de */}
      {!mostrarCrud && !mostrarAcercaDe && (
        <button
          className="btn-floating-info"
          onClick={() => setMostrarAcercaDe(true)}
          title="Acerca de"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      )}

      {mostrarAcercaDe && (
        <div className="crud-overlay" style={{ zIndex: 9999 }}>
          <div className="crud-modal" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <button className="crud-close" onClick={() => setMostrarAcercaDe(false)}>✕</button>
            <h2 style={{ margin: '0 0 20px 0', color: 'var(--primary-color)' }}>Acerca de</h2>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' }}>
              Creado por: <strong>Marcos Aragón</strong>
            </p>
            <p>
              Esta biblioteca virtual ha sido creada con el propósito de aprender y mostrar mis capacidades. Además de la gestión de mi colección de videojuegos propia.
              <br />
              Las portadas de los juegos han sido obtenidas de <a href="https://www.thecoverproject.net/">The Cover Project</a>
              <br />
              Los efectos de sonido y las imágenes de fondo han sido obtenidos de
              <br />
              <a href="http://pixabay.com/">Pixabay</a> y <a href="https://pinterest.com">Pinterest</a>
            </p>
            <p>Para ver más visita mi perfil de <a href="https://github.com/MarcosAragon">GitHub</a></p>
            <button
              style={{ background: 'var(--primary-color)', color: '#464545ff', padding: '10px 30px', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              onClick={() => setMostrarAcercaDe(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}