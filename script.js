/* ==========================================================================
   CONFIGURACIÓN PRINCIPAL (ORÁCULO DE LUCHADORAS)
   ========================================================================== */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDvhzMvr3JkslXdFtddpXABdddtMInGVra9chTDnJ2nx76oeDX--2ji0B6zHZFJJZV/exec";
const ENCRYPTION_KEY = "TuClaveSecretaDelOraculo";
 
let hojaActual = 1;
const totalHojas = 3;
 
/* ==========================================================================
   1. INICIALIZACIÓN Y EVENTOS DIRECTOS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Navegación de botones
  document.getElementById("btn-a-hoja-2")?.addEventListener("click", () => cambiarHoja(1));
  document.getElementById("btn-a-hoja-1-desde-2")?.addEventListener("click", () => cambiarHoja(-1));
  document.getElementById("btn-a-hoja-3")?.addEventListener("click", () => cambiarHoja(1));
  document.getElementById("btn-a-hoja-2-desde-3")?.addEventListener("click", () => cambiarHoja(-1));
 
  // Evento casilla consentimiento
  const checkConsentimiento = document.getElementById("consentimiento-legal");
  if (checkConsentimiento) {
    checkConsentimiento.addEventListener("change", verificarConsentimiento);
  }
 
  // Evento envío de formulario
  const formulario = document.getElementById("formularioOraculo");
  if (formulario) {
    formulario.addEventListener("submit", manejarEnvioFormulario);
  }
 
  verificarConsentimiento();
});
 
/* ==========================================================================
   2. NAVEGACIÓN
   ========================================================================== */
function cambiarHoja(direccion) {
  const nuevaHoja = hojaActual + direccion;
  if (nuevaHoja >= 1 && nuevaHoja <= totalHojas) {
    hojaActual = nuevaHoja;
    actualizarInterfaz();
  }
}
 
function actualizarInterfaz() {
  document.querySelectorAll(".hoja").forEach(hoja => hoja.classList.remove("activa"));
 
  const hojaParaMostrar = document.getElementById(`hoja-${hojaActual}`);
  if (hojaParaMostrar) hojaParaMostrar.classList.add("activa");
 
  document.querySelectorAll(".punto").forEach(punto => {
    const valorPunto = parseInt(punto.getAttribute("data-punto"), 10);
    punto.classList.remove("activo", "completo");
 
    if (valorPunto === hojaActual) {
      punto.classList.add("activo");
    } else if (valorPunto < hojaActual) {
      punto.classList.add("completo");
    }
  });
 
  document.querySelector(".progreso")?.setAttribute("aria-valuenow", hojaActual);
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
   3. PROCESAMIENTO DE ARCHIVO Y CIFRADO
   ========================================================================== */
function archivoABase64Completo(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const lector = new FileReader();
    // Enviamos el DataURL COMPLETO para que Apps Script lo pueda dividir con .split(',')
    lector.onload = () => resolve(lector.result);
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
    const inputFoto = document.getElementById("inputFoto");
    let fotoBase64Data = "";
    let fotoNombre = "";
 
    if (inputFoto && inputFoto.files[0]) {
      fotoBase64Data = await archivoABase64Completo(inputFoto.files[0]);
      fotoNombre = inputFoto.files[0].name;
    }
 
    const idUsuario = document.getElementById("autorizaID")?.value || "";
    const contactoUsuario = document.getElementById("autorizaContacto")?.value || "";
 
    const idEncriptado = encriptarDato(idUsuario);
    const contactoEncriptado = encriptarDato(contactoUsuario);
 
    // PAYLOAD SINCRO EXACTA CON TU APPS SCRIPT:
    const payload = {
      nombreCompleto: document.getElementById("nombreCompleto")?.value || "",
      nacimiento: document.getElementById("nacimiento")?.value || "",
      region: document.getElementById("region")?.value || "",
      tipoLucha: document.getElementById("tipoLucha")?.value || "",
      hechoCentral: document.getElementById("hechoCentral")?.value || "",
      legadoImpacto: document.getElementById("legadoImpacto")?.value || "",
      fraseReflexion: document.getElementById("fraseReflexion")?.value || "",
      queSeSepara: document.getElementById("queSeSepara")?.value || "",
      fotoBase64: fotoBase64Data, // DataURL completo (con data:image/...;base64,)
      fotoNombre: fotoNombre,
      autorizaNombre: document.getElementById("autorizaNombre")?.value || "",
      autorizaID: idEncriptado,               // Cifrado 🔒
      autorizaRelacion: document.getElementById("autorizaRelacion")?.value || "",
      autorizaContacto: contactoEncriptado,   // Cifrado 🔒
      consentimiento: document.getElementById("consentimiento-legal")?.checked ? "ACEPTADO" : "NO"
    };
 
    // Envío seguro
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
 