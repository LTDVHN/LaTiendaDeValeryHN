// ========================================
// VARIABLES GLOBALES
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcipMAUS7L88gMZ5YfJ3UPXagn38IyAhd71W4qLWvcMZ8_-i5qp3P_y3TcjvKBQmvf/exec';

let contador = 0;
let carrito = [];
let productos = [];
let productosFiltrados = [];
let productoSeleccionado;
let editandoProducto = false;
let autenticado = false;
let imagenSeleccionada = null;
let categoriaActiva = 'Todas';
let terminoBusqueda = '';

// CAMBIAR ESTA CONTRASEÑA
const PASSWORD_ADMIN = "admin123";

// ========================================
// FUNCIONES DE PRODUCTOS Y GOOGLE SHEETS
// ========================================

async function cargarProductos() {
  try {
    const response = await fetch(`${SCRIPT_URL}?sheet=Inventario`, {
      method: 'GET',
      redirect: 'follow'
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Error al cargar productos:', data.error);
      productos = [];
    } else if (data.values && data.values.length > 0) {
      productos = data.values.map(row => ({
        id: row[0],
        nombre: row[1],
        precio: parseFloat(row[2]),
        imagen: row[3],
        categoria: row[4] || 'Sin categoría' // NUEVO: categoría
      }));
    } else {
      productos = [];
    }
    
    productosFiltrados = [...productos];
    generarCategoriasDinamicas();
    actualizarCategoriasExistentes();
    mostrarProductos();
    actualizarContadorResultados();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    productos = [];
    productosFiltrados = [];
    mostrarProductos();
  }
}

async function guardarProductoEnSheet(producto) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheet: 'Inventario',
        values: [producto.id, producto.nombre, producto.precio, producto.imagen, producto.categoria]
      })
    });
    
    return true;
  } catch (error) {
    console.error('Error al guardar en Sheets:', error);
    return false;
  }
}

// ========================================
// NUEVO: SISTEMA DE BÚSQUEDA Y FILTROS
// ========================================

function filtrarProductos() {
  terminoBusqueda = document.getElementById('busquedaInput').value.toLowerCase().trim();
  aplicarFiltros();
}

function limpiarBusqueda() {
  document.getElementById('busquedaInput').value = '';
  terminoBusqueda = '';
  aplicarFiltros();
}

function filtrarPorCategoria(categoria) {
  categoriaActiva = categoria;
  
  // Actualizar botones activos
  document.querySelectorAll('.btn-categoria').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  aplicarFiltros();
}

function aplicarFiltros() {
  productosFiltrados = productos.filter(producto => {
    // Filtro por búsqueda
    const coincideBusqueda = terminoBusqueda === '' || 
      producto.nombre.toLowerCase().includes(terminoBusqueda) ||
      producto.categoria.toLowerCase().includes(terminoBusqueda);
    
    // Filtro por categoría
    const coincideCategoria = categoriaActiva === 'Todas' || 
      producto.categoria === categoriaActiva;
    
    return coincideBusqueda && coincideCategoria;
  });
  
  ordenarProductos();
}

function ordenarProductos() {
  const orden = document.getElementById('ordenSelect').value;
  
  switch(orden) {
    case 'nombre-asc':
      productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'nombre-desc':
      productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
    case 'precio-asc':
      productosFiltrados.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-desc':
      productosFiltrados.sort((a, b) => b.precio - a.precio);
      break;
    case 'recientes':
      productosFiltrados.sort((a, b) => b.id - a.id);
      break;
  }
  
  mostrarProductos();
  actualizarContadorResultados();
}

function generarCategoriasDinamicas() {
  const categorias = [...new Set(productos.map(p => p.categoria))].filter(c => c !== 'Sin categoría');
  const container = document.getElementById('categoriasdinamicas');
  
  container.innerHTML = '';
  
  categorias.forEach(categoria => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria';
    btn.onclick = () => filtrarPorCategoria(categoria);
    btn.innerHTML = `<i class="fas fa-tag"></i> ${categoria}`;
    container.appendChild(btn);
  });
}

function actualizarContadorResultados() {
  const contador = document.getElementById('contadorResultados');
  const total = productosFiltrados.length;
  const textoCategoria = categoriaActiva !== 'Todas' ? ` en "${categoriaActiva}"` : '';
  const textoBusqueda = terminoBusqueda !== '' ? ` que coinciden con "${terminoBusqueda}"` : '';
  
  contador.innerHTML = `
    <i class="fas fa-box"></i> Mostrando <strong>${total}</strong> producto${total !== 1 ? 's' : ''}${textoCategoria}${textoBusqueda}
  `;
}

function actualizarCategoriasExistentes() {
  const categorias = [...new Set(productos.map(p => p.categoria))].filter(c => c !== 'Sin categoría');
  const datalist = document.getElementById('categoriasExistentes');
  
  datalist.innerHTML = '';
  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria;
    datalist.appendChild(option);
  });
}

// ========================================
// MOSTRAR PRODUCTOS
// ========================================

function mostrarProductos() {
  const contenedor = document.getElementById('productosContenedor');
  contenedor.innerHTML = '';

  if (productosFiltrados.length === 0) {
    let mensaje = '<div class="sin-resultados">';
    mensaje += '<i class="fas fa-search" style="font-size: 60px; color: #ccc; margin-bottom: 20px;"></i>';
    
    if (productos.length === 0) {
      mensaje += '<h2>No hay productos disponibles</h2>';
      mensaje += '<p>Use el panel de administración para agregar productos</p>';
    } else {
      mensaje += '<h2>No se encontraron productos</h2>';
      mensaje += '<p>Intenta con otra búsqueda o categoría</p>';
      mensaje += '<button onclick="limpiarBusqueda(); filtrarPorCategoria(\'Todas\')" style="margin-top: 15px;"><i class="fas fa-redo"></i> Ver todos los productos</button>';
    }
    
    mensaje += '</div>';
    contenedor.innerHTML = mensaje;
    return;
  }

  productosFiltrados.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.setAttribute('data-categoria', producto.categoria);
    
    const botonesAdmin = autenticado ? `
      <button class="btn-editar-producto" onclick="editarProducto(${producto.id})">
        <i class="fas fa-edit"></i> Editar
      </button>
      <button class="btn-eliminar-producto" onclick="eliminarProductoAdmin(${producto.id})">
        <i class="fas fa-trash"></i>
      </button>
    ` : '';
    
    div.innerHTML = `
      ${botonesAdmin}
      <span class="badge-categoria">${producto.categoria}</span>
      <h3>${producto.nombre}</h3>
      <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-principal" onclick="this.classList.toggle('ampliada')">
      <p>Precio: <span class="texto-grande">Lps ${producto.precio.toFixed(2)}</span></p>
      <button onclick="agregarACarrito('${escaparComillas(producto.nombre)}', ${producto.precio}, '${escaparComillas(producto.imagen)}')">
        <i class="fas fa-cart-plus"></i> Agregar a carrito
      </button>
      <button onclick="solicitarDatos('${escaparComillas(producto.nombre)}', ${producto.precio}, '${escaparComillas(producto.imagen)}')">
        <i class="fas fa-shopping-bag"></i> Comprar
      </button>
    `;
    contenedor.appendChild(div);
  });
}

function escaparComillas(texto) {
  return texto.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ========================================
// FUNCIONES DE ADMINISTRACIÓN
// ========================================

function toggleAdmin() {
  if (!autenticado) {
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('passwordInput').value = '';
  } else {
    document.getElementById('adminModal').style.display = 'block';
    limpiarFormularioAdmin();
  }
}

function verificarPassword() {
  const password = document.getElementById('passwordInput').value;
  
  if (password === PASSWORD_ADMIN) {
    autenticado = true;
    cerrarPassword();
    document.getElementById('adminModal').style.display = 'block';
    limpiarFormularioAdmin();
    mostrarProductos();
  } else {
    alert('Contraseña incorrecta');
    document.getElementById('passwordInput').value = '';
  }
}

function cerrarPassword() {
  document.getElementById('passwordModal').style.display = 'none';
  document.getElementById('passwordInput').value = '';
}

function cerrarAdmin() {
  document.getElementById('adminModal').style.display = 'none';
  limpiarFormularioAdmin();
}

function limpiarFormularioAdmin() {
  document.getElementById('adminNombre').value = '';
  document.getElementById('adminPrecio').value = '';
  document.getElementById('adminImagen').value = '';
  document.getElementById('adminCategoria').value = '';
  document.getElementById('editarProductoId').value = '';
  document.getElementById('textoBotonAdmin').innerText = 'Agregar Producto';
  document.getElementById('previewContainer').style.display = 'none';
  editandoProducto = false;
}

async function agregarProducto() {
  if (!autenticado) {
    alert('Debe autenticarse primero');
    return;
  }

  const nombre = document.getElementById('adminNombre').value.trim();
  const precio = parseFloat(document.getElementById('adminPrecio').value);
  const imagen = document.getElementById('adminImagen').value.trim();
  const categoria = document.getElementById('adminCategoria').value.trim() || 'Sin categoría';

  if (!nombre || !precio || !imagen) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  if (precio <= 0) {
    alert('El precio debe ser mayor a 0');
    return;
  }

  const productoId = document.getElementById('editarProductoId').value;

  if (productoId) {
    // Editar producto existente
    const index = productos.findIndex(p => p.id === parseInt(productoId));
    if (index !== -1) {
      productos[index] = {
        id: parseInt(productoId),
        nombre,
        precio,
        imagen,
        categoria
      };
      document.getElementById('mensaje').innerText = 'Producto actualizado. Recargando...';
    }
  } else {
    // Agregar nuevo producto
    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const nuevoProducto = {
      id: nuevoId,
      nombre,
      precio,
      imagen,
      categoria
    };
    
    await guardarProductoEnSheet(nuevoProducto);
    document.getElementById('mensaje').innerText = 'Producto agregado. Recargando...';
  }

  // Recargar productos desde Sheets
  setTimeout(() => {
    cargarProductos();
    cerrarAdmin();
  }, 1000);
}

function editarProducto(id) {
  if (!autenticado) {
    alert('Debe autenticarse primero');
    return;
  }

  const producto = productos.find(p => p.id === id);
  if (producto) {
    document.getElementById('adminNombre').value = producto.nombre;
    document.getElementById('adminPrecio').value = producto.precio;
    document.getElementById('adminImagen').value = producto.imagen;
    document.getElementById('adminCategoria').value = producto.categoria;
    document.getElementById('imagenPreview').src = producto.imagen;
    document.getElementById('previewContainer').style.display = 'block';
    document.getElementById('editarProductoId').value = producto.id;
    document.getElementById('textoBotonAdmin').innerText = 'Actualizar Producto';
    editandoProducto = true;
    document.getElementById('adminModal').style.display = 'block';
  }
}

async function eliminarProductoAdmin(id) {
  if (!autenticado) {
    alert('Debe autenticarse primero');
    return;
  }

  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    productos = productos.filter(p => p.id !== id);
    document.getElementById('mensaje').innerText = 'Producto eliminado. Recargando...';
    
    // Recargar productos desde Sheets
    setTimeout(() => {
      cargarProductos();
    }, 1000);
  }
}

// ========================================
// FUNCIONES DE CARRITO
// ========================================

function agregarACarrito(producto, precio, imagen) {
  carrito.push({ producto, precio, imagen });
  contador++;
  document.getElementById('contadorCarrito').innerText = contador;
  document.getElementById('mensaje').innerText = producto + " ha sido agregado al carrito.";
}

function solicitarDatos(producto, precio, imagen) {
  productoSeleccionado = { producto, precio, imagen };
  agregarACarrito(producto, precio, imagen);
  document.getElementById('datosModal').style.display = "block";
  document.getElementById('nombre').value = "";
  document.getElementById('apellido').value = "";
}

function solicitarDatosCarrito() {
  document.getElementById('datosModal').style.display = "block";
}

function cerrarModalDatos() {
  document.getElementById('datosModal').style.display = "none";
}

function cerrarModalCarrito() {
  document.getElementById('carritoModal').style.display = "none";
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function capitalizarInput(input) {
  input.value = capitalizar(input.value);
}

function enviarDatos() {
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;

  if (nombre && apellido) {
    finalizarCompra(nombre, apellido);
    cerrarModalDatos();
  } else {
    document.getElementById('mensaje').innerText = "Debe ingresar nombre y apellido para continuar.";
  }
}

function verCarrito() {
  const contenidoCarritoModal = document.getElementById('contenidoCarritoModal');
  contenidoCarritoModal.innerHTML = "";
  let total = 0;

  if (carrito.length === 0) {
    contenidoCarritoModal.innerHTML = "<p>No hay productos en el carrito.</p>";
    document.getElementById('totalCompra').innerText = "";
  } else {
    carrito.forEach((item, index) => {
      contenidoCarritoModal.innerHTML += `
        <div class="producto-modal">
          <img src="${item.imagen}" alt="${item.producto}" class="img-modal">
          <div>
            <p><strong>${item.producto}</strong></p>
            <p>Precio: Lps ${item.precio.toFixed(2)}</p>
            <button class="btn-eliminar" onclick="eliminarProducto(${index})">Eliminar</button>
          </div>
        </div>
      `;
      total += item.precio;
    });
    document.getElementById('totalCompra').innerText = "Total: Lps " + total.toFixed(2);
  }

  document.getElementById('carritoModal').style.display = "block";
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  contador--;
  document.getElementById('contadorCarrito').innerText = contador;
  verCarrito();
  document.getElementById('mensaje').innerText = "Producto eliminado del carrito.";
}

function contarProductos(carrito) {
  const conteo = {};
  carrito.forEach(item => {
    if (conteo[item.producto]) {
      conteo[item.producto]++;
    } else {
      conteo[item.producto] = 1;
    }
  });
  return conteo;
}

function finalizarCompra(nombre, apellido) {
  const numeroWhatsApp = "50493293125";
  let mensaje = `Hola, soy ${nombre} ${apellido} y quiero comprar los siguientes productos:\n`;

  const conteo = contarProductos(carrito);

  Object.keys(conteo).forEach(producto => {
    const item = carrito.find(item => item.producto === producto);
    
    mensaje += `*Producto:* ${producto}\n`;
    mensaje += `*Cantidad:* ${conteo[producto]}\n`;
    mensaje += `*Precio:* Lps ${item.precio.toFixed(2)}\n`;
    mensaje += `*Imagen:* ${item.imagen}\n\n`;
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  mensaje += `*Total:* Lps ${total.toFixed(2)}`;

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  carrito = [];
  contador = 0;
  document.getElementById('contadorCarrito').innerText = contador;
  cerrarModalCarrito();
  cerrarModalDatos();
  document.getElementById('mensaje').innerText = "Gracias por tu compra.";
}

// ========================================
// SELECTOR DE IMÁGENES DE GOOGLE DRIVE
// ========================================

async function abrirSelectorImagenes() {
  const modal = document.getElementById('modalImagenes');
  const container = document.getElementById('imagenesContainer');
  
  modal.classList.add('active');
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando imágenes de Google Drive...</div>';
  
  try {
    const response = await fetch(`${SCRIPT_URL}?action=listImages`, {
      method: 'GET',
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error('Error al conectar con Google Drive');
    }
    
    const data = await response.json();
    
    if (data.error) {
      container.innerHTML = `<p style="color: red; text-align: center;">Error: ${data.error}</p>`;
      return;
    }
    
    if (!data.images || data.images.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">No hay imágenes en la carpeta de Google Drive.<br><br>Sube algunas imágenes a tu carpeta configurada.</p>';
      return;
    }
    
    mostrarImagenes(data.images);
    
  } catch (error) {
    console.error('Error al cargar imágenes:', error);
    container.innerHTML = `<p style="color: red; text-align: center; padding: 40px;">Error al cargar las imágenes: ${error.message}<br><br>Verifica que el Google Apps Script esté configurado correctamente.</p>`;
  }
}

function mostrarImagenes(images) {
  const container = document.getElementById('imagenesContainer');
  const grid = document.createElement('div');
  grid.className = 'images-grid';
  
  // Obtener URLs de imágenes ya usadas
  const imagenesEnUso = productos.map(p => p.imagen);
  
  images.forEach(img => {
    const card = document.createElement('div');
    const estaEnUso = imagenesEnUso.includes(img.url);
    
    card.className = 'image-card';
    if (estaEnUso) card.classList.add('image-used');
    card.onclick = () => seleccionarImagen(img, card);
    
    const badgeHtml = estaEnUso ? '<span class="badge-used">✓ En uso</span>' : '';
    
    // Crear elementos separados para manejar el error de carga
    const imgElement = document.createElement('img');
    imgElement.src = img.thumbnail;
    imgElement.alt = img.name;
    imgElement.onerror = function() {
      this.src = img.url;
    };
    
    const nameElement = document.createElement('p');
    nameElement.textContent = img.name;
    
    if (badgeHtml) {
      const badge = document.createElement('span');
      badge.className = 'badge-used';
      badge.textContent = '✓ En uso';
      card.appendChild(badge);
    }
    
    card.appendChild(imgElement);
    card.appendChild(nameElement);
    
    grid.appendChild(card);
  });
  
  container.innerHTML = '';
  container.appendChild(grid);
}

function seleccionarImagen(img, card) {
  document.querySelectorAll('.image-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  imagenSeleccionada = img;
}

function confirmarSeleccion() {
  if (!imagenSeleccionada) {
    alert('Por favor selecciona una imagen');
    return;
  }
  
  document.getElementById('adminImagen').value = imagenSeleccionada.url;
  document.getElementById('imagenPreview').src = imagenSeleccionada.url;
  document.getElementById('previewContainer').style.display = 'block';
  
  cerrarModalImagenes();
}

function cerrarModalImagenes() {
  const modal = document.getElementById('modalImagenes');
  if (modal) {
    modal.classList.remove('active');
  }
  imagenSeleccionada = null;
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
  const modal = document.getElementById('modalImagenes');
  if (event.target === modal) {
    cerrarModalImagenes();
  }
}
