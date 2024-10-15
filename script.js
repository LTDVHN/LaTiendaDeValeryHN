let contador = 0; // Inicializa el contador del carrito
let carrito = []; // Array para almacenar los productos en el carrito

function agregarACarrito(producto, precio, imagen) {
  carrito.push({ producto, precio, imagen }); // Agrega el producto al carrito
  contador++; // Incrementa el contador
  document.getElementById('contadorCarrito').innerText = contador; // Actualiza el contador en el HTML
  
  // Muestra el mensaje en el div en lugar de un alert
  document.getElementById('mensaje').innerText = producto + " ha sido agregado al carrito.";
}

function comprar(producto) {
  const numeroWhatsApp = "50493293125"; // Tu número de WhatsApp
  const mensaje = "Hola, me gustaría comprar el siguiente producto: " + producto;

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  // Muestra un mensaje de compra en el div
  document.getElementById('mensaje').innerText = "Estás comprando: " + producto;
}

function verCarrito() {
  const contenidoCarritoModal = document.getElementById('contenidoCarritoModal');
  contenidoCarritoModal.innerHTML = ""; // Limpiar el contenido previo
  let total = 0; // Inicializa el total

  if (carrito.length === 0) {
    contenidoCarritoModal.innerHTML = "<p>No hay productos en el carrito.</p>";
    document.getElementById('totalCompra').innerText = ""; // Limpia el total
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
      `; // Muestra cada producto en el carrito
      total += item.precio; // Suma el precio del producto al total
    });
    document.getElementById('totalCompra').innerText = "Total: Lps " + total; // Muestra el total
  }

  document.getElementById('carritoModal').style.display = "block"; // Muestra el modal
}

function eliminarProducto(index) {
  carrito.splice(index, 1); // Elimina el producto del carrito
  contador--; // Decrementa el contador
  document.getElementById('contadorCarrito').innerText = contador; // Actualiza el contador en el HTML
  verCarrito(); // Vuelve a mostrar el carrito
  document.getElementById('mensaje').innerText = "Producto eliminado del carrito."; // Muestra mensaje de eliminación
}

function cerrarModal() {
  document.getElementById('carritoModal').style.display = "none"; // Cierra el modal
}

function finalizarCompra() {
  const numeroWhatsApp = "50493293125"; // Tu número de WhatsApp
  let mensaje = "Hola, quiero comprar los siguientes productos:\n";

  carrito.forEach(item => {
    mensaje += `${item.producto} - Precio: Lps ${item.precio}\n`; // Agrega productos al mensaje
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0); // Calcula el total
  mensaje += `Total: Lps ${total}`; // Agrega el total al mensaje

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank'); // Abre WhatsApp con el mensaje

  // Resetea el carrito
  carrito = [];
  contador = 0;
  document.getElementById('contadorCarrito').innerText = contador; // Actualiza el contador en el HTML
  cerrarModal(); // Cierra el modal
  document.getElementById('mensaje').innerText = "Gracias por tu compra."; // Mensaje de compra
}
// Agrega un evento de clic a todas las imágenes con la clase 'imagen-principal'
document.querySelectorAll('.imagen-principal').forEach(item => {
  item.addEventListener('click', function() {
    this.classList.toggle('ampliada');
  });
});