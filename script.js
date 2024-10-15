let contador = 0;
let carrito = [];
let productoSeleccionado;

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

  const botonEnviar = document.querySelector('#datosModal button');
  botonEnviar.addEventListener('click', function() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;

    if (nombre && apellido) {
      comprar(producto, nombre, apellido);
      cerrarModalDatos();
    } else {
      document.getElementById('mensaje').innerText = "Debe ingresar nombre y apellido para continuar.";
    }
  });
}

function solicitarDatosCarrito() {
  document.getElementById('datosModal').style.display = "block";
}

function cerrarModalDatos() {
  document.getElementById('datosModal').style.display = "none";
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

function comprar(producto, nombre, apellido) {
  const numeroWhatsApp = "50493293125";
  const imagenProducto = productoSeleccionado.imagen;
  const mensaje = `Hola, soy ${nombre} ${apellido} y me gustaría comprar el siguiente producto:\n*Producto:* ${producto}\n*Imagen:* ${imagenProducto}`;

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  document.getElementById('mensaje').innerText = `Estás comprando: ${producto}`;
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
            <p>Precio: Lps ${item.precio}</p>
            <button class="btn-eliminar" onclick="eliminarProducto(${index})">Eliminar</button>
          </div>
        </div>
      `;
      total += item.precio;
    });
    document.getElementById('totalCompra').innerText = "Total: Lps " + total;
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

function cerrarModal() {
  document.getElementById('carritoModal').style.display = "none";
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
    
    // Obtener el ID de la imagen desde la URL original
    const imagenID = item.imagen.split("id=")[1]; // Esto obtiene el ID después de 'id='
    
    // Crear el enlace utilizando el ID en el formato deseado
    const imagenDirecta = `https://drive.google.com/file/d/${imagenID}`;

    mensaje += `*Producto:* ${producto}\n`;
    mensaje += `*Cantidad:* ${conteo[producto]}\n`;
    mensaje += `*Precio:* Lps ${item.precio}\n`;
    mensaje += `*Imagen:* ${imagenDirecta}\n\n`;
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  mensaje += `*Total:* Lps ${total}`;

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  carrito = [];
  contador = 0;
  document.getElementById('contadorCarrito').innerText = contador;
  cerrarModal();
  cerrarModalDatos();
  document.getElementById('mensaje').innerText = "Gracias por tu compra.";
}

function establecerImagenes() {
  document.querySelectorAll('.imagen-principal').forEach(imagen => {
    imagen.src = imagen.getAttribute('data-imagen');
  });
}

window.addEventListener('load', establecerImagenes);

document.querySelectorAll('.imagen-principal').forEach(item => {
  item.addEventListener('click', function() {
    this.classList.toggle('ampliada');
  });
});
