import fs from 'fs/promises';
import { validarTareas } from './validarTareas.js';

// LEER Y VALIDAR TAREAS
export async function obtenerDato() {
  try {
    const data = await fs.readFile('./tasks.json', 'utf-8');
    const tareas = JSON.parse(data);

    if (!Array.isArray(tareas)) {
      console.log('Error: El archivo no tiene un arreglo');
      return [];
    }

    const tareasValidas = tareas.filter(validarTareas);
    console.log(`Se cargaron exitosamente ${tareasValidas.length} tarea/s validas.`);
    return tareasValidas;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(" 'tasks.json' no existe. Iniciando lista vacia");
    } else if (error instanceof SyntaxError) {
      console.log(" 'tasks.json' esta mal formateado.");
    }
    return [];
  }
}

//  GUARDAR EN DISCO
export async function guardarTarea(tareas) {
  try {
    const data = JSON.stringify(tareas, null, 2);
    await fs.writeFile('./tasks.json', data, 'utf-8');
  } catch (error) {
    console.log('Error al guardar:', error.message);
  }
}

// MOSTRAR DETALLE CON EMOJIS
export function mostrarDetalleTarea(tarea) {
  const emojisDificultad = {
    1: "⭐ Fácil",
    2: "⭐⭐ Medio",
    3: "⭐⭐⭐ Difícil"
  };
  
  const nivelVisual = emojisDificultad[tarea.dificultad] || "Sin definir";

  console.log(`
   Título: ${tarea.titulo}
  Descripción: ${tarea.descripcion || "Sin descripción"}
   Estado: ${tarea.estado}
   Creación: ${tarea.creacion}
   Vencimiento: ${tarea.vencimiento || "Sin vencimiento"}
   Costo: ${nivelVisual}
  `);
}

// AGREGAR TAREA (Valores por defecto automáticos)
export async function agregarTarea(titulo, descripcion, vencimiento, dificultad) {
  const tareas = await obtenerDato();

  const nueva = {
    titulo: titulo || "Sin titulo",
    descripcion: descripcion || null,
    estado: "PENDING", // Por defecto
    creacion: new Date().toISOString(), // Fecha actual automática
    ultimaEdicion: null,
    vencimiento: vencimiento || null,
    dificultad: dificultad || 1 // Por defecto Fácil
  };

  if (!validarTareas(nueva)) {
    console.log(" La tarea ingresada no es valida.");
    return;
  }

  tareas.push(nueva);
  await guardarTarea(tareas);
  console.log(`\nNueva tarea agregada:`);
  mostrarDetalleTarea(nueva);
}

//  EDITAR TAREA
export async function editarTarea(indice, nuevoEstado, nuevaDescripcion, nuevaDificultad) {
  const tareas = await obtenerDato();

  if (indice < 0 || indice >= tareas.length) {
    console.log("❌ Error: Índice no encontrado.");
    return;
  }

  const tareaSeleccionada = tareas[indice];

  // Modificamos solo lo que nos envíen
  if (nuevoEstado !== undefined) tareaSeleccionada.estado = nuevoEstado;
  if (nuevaDescripcion !== undefined) tareaSeleccionada.descripcion = nuevaDescripcion;
  if (nuevaDificultad !== undefined) tareaSeleccionada.dificultad = nuevaDificultad;

  // Actualizamos la fecha de edición
  tareaSeleccionada.ultimaEdicion = new Date().toISOString();

  if (!validarTareas(tareaSeleccionada)) {
    console.log("❌ Error: Las modificaciones rompieron el formato.");
    return;
  }

  await guardarTarea(tareas);
  console.log(`\n✏️ Tarea editada con éxito:`);
  mostrarDetalleTarea(tareaSeleccionada);
}

// 6. FUNCIÓN DE PRUEBA
async function main() {
  console.log("--- INICIANDO SISTEMA ---");
  
  // Prueba A: Agregamos una tarea (Titulo, Descripción, Vencimiento, Dificultad)
  await agregarTarea(
    "Aprender persistencia en Node", 
    "Leer y escribir archivos JSON", 
    null, 
    2 // Medio
  );
  
  // Prueba B: Editamos la última tarea de la lista para pasarla a "IN-PROGRESS"
  const tareas = await obtenerDato();
  const ultimoIndice = tareas.length - 1;
  await editarTarea(ultimoIndice, "IN-PROGRESS", "Practicando con código real", undefined);
}

main();
