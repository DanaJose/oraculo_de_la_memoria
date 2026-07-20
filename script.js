/* ==========================================================================
   CONFIGURACIÓN PRINCIPAL (ORÁCULO DE LUCHADORAS)
   ========================================================================== */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/.../exec"; 
const ENCRYPTION_KEY = "TuClaveSecretaDelOraculo";

let hojaActual = 1;
const totalHojas = 3;

/* ==========================================================================
   1. INICIALIZACIÓN Y EVENTOS DIRECTOS (Mapeado a tus IDs del HTML)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Enlazar la navegación de tus botones reales
  document.getElementById("btn-a-hoja-2")?.addEventListener("click", () => cambiarHoja(1));
  document.getElementById("btn-a-hoja-1-desde-2")?.addEventListener("click", () => cambiarHoja(-1));
  document.getElementById("btn-a-hoja-3")?.addEventListener("click", () => cambiarHoja(1));
  document.getElementById("btn-a-hoja-2-desde-3")?.addEventListener("click", () => cambiarHoja(-1));

  // 2. Escuchar el cambio en tu casilla de consentimiento real
  const checkConsentimiento = document.getElementById("consentimiento-legal");
  if (checkConsentimiento) {
    checkConsentimiento.addEventListener("change", verificarConsentimiento);
  }

  // 3. Escuchar el envío de tu formulario único
  const formulario = document.getElementById("formularioOraculo");
  if (formulario) {
    formulario.addEventListener("submit", manejarEnvioFormulario);
  }

  // Inicializar estado del botón de la hoja 1
  verificarConsentimiento();
});

/* ==========================================================================
   2. CONTROL DE FLUJO Y NAVEGACIÓN DE PESTAÑAS
   ========================================================================== */
function cambiarHoja(direccion) {
  const nuevaHoja = hojaActual + direccion;
  if (nuevaHoja >= 1 && nuevaHoja <= totalHojas) {
    hojaActual = nuevaHoja;
    actualizarInterfaz();
  }
}

function actualizarInterfaz() {
  // Ocultar todas las secciones "hoja"
  document.querySelectorAll(".hoja").forEach(hoja => hoja.classList.remove("activa"));

  // Mostrar la sección correspondiente
  const hojaParaMostrar = document.getElementById(`hoja-${hojaActual}`);
  if (hojaParaMostrar) hojaParaMostrar.classList.add("activa");

  // Actualizar los puntos de la barra de progreso usando tu atributo data-punto
  document.querySelectorAll(".punto").forEach(punto => {
    const valorPunto = parseInt(punto.getAttribute("data-punto"), 10);
    punto.classList.remove("activo", "completo");
    
    if (valorPunto === hojaActual) {
      punto.classList.add("activo");
    } else if (valorPunto < hojaActual) {
      punto.classList.add("completo");
    }
  });

  // Ajustar el aria-valuenow para accesibilidad
  document.querySelector(".progreso")?.setAttribute("aria-valuenow", hojaActual);

  // Subir el scroll suavemente
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function verificarConsentimiento() {
  const checkConsentimiento = document.getElementById("consentimiento-legal");
  const btnSiguiente1 = document.getElementById("btn-a-hoja-2");
  
  if (checkConsentimiento && btnSiguiente1) {
    btnSiguiente1.disabled = !checkConsentimiento.checked;
  }
}

/* ==========================================================================
   3. PROCESAMIENTO Y CIFRADO SEGURO (CryptoJS)
   ========================================================================== */
function archivoABase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve("");
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result.split(",")[1]);
    lector.onerror = error => reject(error);
    lector.readAsDataURL(file);
  });
}

function encriptarDato(dato) {
  if (!dato || dato.trim() === "") return "";
  return CryptoJS.AES.encrypt(dato.trim(), ENCRYPTION_KEY).toString();
}

/* ==========================================================================
   4. ENVÍO FINAL DE DATOS AL BACKEND
   ========================================================================== */
async function manejarEnvioFormulario(e) {
  e.preventDefault();
  
  const btnFinalizar = document.getElementById("btn-finalizar");
  if (btnFinalizar) {
    btnFinalizar.disabled = true;
    btnFinalizar.innerText = "Cifrando y resguardando historia...";
  }

  try {
    // Procesar la imagen desde tu ID real 'inputFoto'
    const inputFoto = document.getElementById("inputFoto");
    let fotoBase64 = "";
    if (inputFoto && inputFoto.files[0]) {
      fotoBase64 = await archivoABase64(inputFoto.files[0]);
    }

    // Extraer datos usando tus IDs exactos del HTML
    const idUsuario = document.getElementById("autorizaID")?.value || "";
    const contactoUsuario = document.getElementById("autorizaContacto")?.value || "";

    // Cifrar localmente los campos sensibles
    const idEncriptado = encriptarDato(idUsuario);
    const contactoEncriptado = encriptarDato(contactoUsuario);

    // Mapear el JSON completo alineado al backend
    const payload = {
      autoriza_nombre: document.getElementById("autorizaNombre")?.value || "",
      autoriza_id: idEncriptado,       // Cifrado🔒
      autoriza_relacion: document.getElementById("autorizaRelacion")?.value || "",
      autoriza_contacto: contactoEncriptado, // Cifrado🔒
      defensora_nombre: document.getElementById("nombreCompleto")?.value || "",
      defensora_nacimiento: document.getElementById("nacimiento")?.value || "",
      defensora_region: document.getElementById("region")?.value || "",
      defensora_lucha: document.getElementById("tipoLucha")?.value || "",
      defensora_historia: document.getElementById("hechoCentral")?.value || "",
      defensora_legado: document.getElementById("legadoImpacto")?.value || "",
      defensora_frase: document.getElementById("fraseReflexion")?.value || "",
      defensora_detalles: document.getElementById("queSeSepara")?.value || "",
      defensora_foto: fotoBase64,
      fecha_registro: new Date().toISOString()
    };

    // Envío seguro por POST al Web App de Google
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Éxito: Ocultar el formulario por completo y mostrar tu hoja-final
    document.getElementById("formularioOraculo").style.display = "none";
    document.querySelector(".progreso").style.display = "none";
    
    const hojaFinal = document.getElementById("hoja-final");
    if (hojaFinal) hojaFinal.classList.add("activa");
    
    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (error) {
    console.error("Error en el envío seguro:", error);
    alert("Hubo un inconveniente al procesar tus datos. Por favor reintenta.");
    if (btnFinalizar) {
      btnFinalizar.disabled = false;
      btnFinalizar.innerText = "Enviar Historia de Forma Segura";
    }
  }
}

