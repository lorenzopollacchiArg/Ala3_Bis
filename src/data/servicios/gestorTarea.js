const fs = require("fs/promises");
const { input } = require("../utilidades/nodeImperativo");
const Tarea = require("./tareas");
const { agregarVencimiento } = require("../utilidades/utilidades");
const { validarTareas } = require("../utilidades/validarTareas");

const RUTA_ARCHIVO = "./tasks.json";

let tareas = [];

const MAPA_ESTADOS = {
    1: "PENDING",
    2: "IN-PROGRESS",
    3: "FINISHED",
    4: "CANCELED"
};

async function cargarTareasDesdeArchivo() {
    try {
        const data = await fs.readFile(RUTA_ARCHIVO, "utf-8");
        const tareasArchivo = JSON.parse(data);

        if (!Array.isArray(tareasArchivo)) {
            console.log("Error: El archivo no contiene un arreglo de tareas.");
            tareas = [];
            return;
        }

        tareas = tareasArchivo.filter(validarTareas);
        console.log(`\nSe han cargado ${tareas.length} tareas validas de ${tareasArchivo.length} totales.`);
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log("El archivo tasks.json no existe. Se iniciara una lista vacia.");
        } else if (error instanceof SyntaxError) {
            console.log("Error: El archivo tasks.json tiene un formato invalido.");
        } else {
            console.log("Error al leer el archivo:", error.message);
        }
        tareas = [];
    }
}

async function guardarTareasEnArchivo() {
    try {
        const data = JSON.stringify(tareas, null, 2);
        await fs.writeFile(RUTA_ARCHIVO, data, "utf-8");
        console.log("Cambios guardados en tasks.json.");
    } catch (error) {
        console.log("Error al guardar en el archivo:", error.message);
    }
}

async function agregarTarea() {
    let continuar;
    do {
        let titulo = await input("\nIngrese el titulo de la tarea (obligatorio): ");
        while (!titulo || titulo.trim() === "") {
            titulo = await input("\nEl titulo no puede estar vacio. Ingrese el titulo: ");
        }

        const descInput = await input("\nIngrese la descripcion (Enter para dejar vacia): ");
        const descripcion = descInput.trim() === "" ? null : descInput;

        let dificultad = parseInt(await input("\nIngrese la dificultad: 1- Facil / 2- Media / 3- Dificil: "), 10);
        while (isNaN(dificultad) || dificultad < 1 || dificultad > 3) {
            dificultad = parseInt(await input("\nIngrese una dificultad valida (1, 2 o 3): "), 10);
        }

        let estadoNum = parseInt(await input("\nIngrese el estado: 1- PENDING | 2- IN-PROGRESS | 3- FINISHED | 4- CANCELED: "), 10);
        while (isNaN(estadoNum) || estadoNum < 1 || estadoNum > 4) {
            estadoNum = parseInt(await input("\nIntente de nuevo: 1- PENDING | 2- IN-PROGRESS | 3- FINISHED | 4- CANCELED: "), 10);
        }
        const estado = MAPA_ESTADOS[estadoNum];

        let vencimiento = null;
        const deseaVencimiento = parseInt(await input("\nDesea ingresar fecha de vencimiento? 1- Si | 2- No: "), 10);
        if (deseaVencimiento === 1) {
            const fechaVen = await agregarVencimiento();
            vencimiento = fechaVen instanceof Date ? fechaVen.toISOString() : (fechaVen ? String(fechaVen) : null);
        }

        const creacion = new Date().toISOString();
        const nuevaTarea = new Tarea(titulo, descripcion, estado, dificultad, vencimiento, creacion, null);

        if (validarTareas(nuevaTarea)) {
            tareas.push(nuevaTarea);
            await guardarTareasEnArchivo();
            console.log(`\nTarea "${nuevaTarea.titulo}" agregada con exito.`);
        } else {
            console.log("\nError: La tarea no cumple con el formato requerido y no fue guardada.");
        }

        continuar = parseInt(await input("\nDesea agregar otra tarea? 1- Si | 2- No: "), 10);
        while (continuar !== 1 && continuar !== 2) {
            continuar = parseInt(await input("\nIntente de nuevo: Desea agregar otra tarea? 1- Si | 2- No: "), 10);
        }
    } while (continuar === 1);
}

function mostrarDetalleTarea(tarea, indiceGeneral) {
    console.log(`\nDetalle de Tarea (Indice: ${indiceGeneral})`);
    console.log(`Titulo:           ${tarea.titulo}`);
    console.log(`Descripcion:      ${tarea.descripcion ?? "Sin descripcion"}`);
    console.log(`Estado:           ${tarea.estado}`);
    console.log(`Dificultad:       ${tarea.dificultad}`);
    console.log(`Fecha Creacion:   ${tarea.creacion}`);
    console.log(`Ultima Edicion:   ${tarea.ultimaEdicion ?? "Sin ediciones"}`);
    console.log(`Vencimiento:      ${tarea.vencimiento ?? "Sin vencimiento"}`);
}

async function verTareasPorEstado(estadoFiltro, nombreEstadoMostrar) {
    let continuar;
    do {
        const filtradas = tareas
            .map((tarea, index) => ({ tarea, indiceOriginal: index }))
            .filter(item => item.tarea.estado === estadoFiltro);

        if (filtradas.length === 0) {
            console.log(`\nNo hay tareas ${nombreEstadoMostrar}.`);
            return;
        }

        console.log(`\nListado de Tareas ${nombreEstadoMostrar}`);
        for (let i = 0; i < filtradas.length; i++) {
            console.log(`${i + 1} - [Indice: ${filtradas[i].indiceOriginal}] Titulo: ${filtradas[i].tarea.titulo}`);
        }

        let seleccion = parseInt(await input(`\nIngrese el numero de la tarea (1 a ${filtradas.length}) para ver el detalle: `), 10);
        while (isNaN(seleccion) || seleccion < 1 || seleccion > filtradas.length) {
            seleccion = parseInt(await input(`\nIntente de nuevo (1 a ${filtradas.length}): `), 10);
        }

        const itemElegido = filtradas[seleccion - 1];
        mostrarDetalleTarea(itemElegido.tarea, itemElegido.indiceOriginal);

        console.log("\nQue desea realizar?");
        let opcionRealizar = parseInt(await input("1- Editar Tarea | 2- Ver otra tarea de esta lista | 3- Salir al menu: "), 10);
        while (isNaN(opcionRealizar) || opcionRealizar < 1 || opcionRealizar > 3) {
            opcionRealizar = parseInt(await input("1- Editar Tarea | 2- Ver otra tarea de esta lista | 3- Salir al menu: "), 10);
        }

        if (opcionRealizar === 1) {
            await editarTareas(itemElegido.indiceOriginal);
            let seguir = parseInt(await input("\nDesea ver otra tarea? 1- Si | 2- Salir: "), 10);
            continuar = (seguir === 1) ? 1 : 2;
        } else if (opcionRealizar === 2) {
            continuar = 1;
        } else {
            continuar = 2;
        }
    } while (continuar === 1);
}

async function verTareaspendientes() {
    await verTareasPorEstado("PENDING", "Pendientes (PENDING)");
}

async function verTareasproceso() {
    await verTareasPorEstado("IN-PROGRESS", "En Proceso (IN-PROGRESS)");
}

async function verTareascompletadas() {
    await verTareasPorEstado("FINISHED", "Completadas (FINISHED)");
}

async function verTareascanceladas() {
    await verTareasPorEstado("CANCELED", "Canceladas (CANCELED)");
}

async function buscarTarea() {
    if (tareas.length === 0) {
        console.log("\nNo hay tareas guardadas.");
        return;
    }

    const palabra = await input("\nIngrese una palabra clave del titulo para buscar: ");

    let continuar;
    do {
        const resultados = tareas
            .map((tarea, index) => ({ tarea, indiceOriginal: index }))
            .filter(item => item.tarea.titulo.toLowerCase().includes(palabra.toLowerCase()));

        if (resultados.length === 0) {
            console.log("\nNo se encontro ninguna tarea con ese criterio.");
            return;
        }

        console.log(`\nResultados para "${palabra}":`);
        for (let i = 0; i < resultados.length; i++) {
            console.log(`${i + 1} - [Indice: ${resultados[i].indiceOriginal}] Titulo: ${resultados[i].tarea.titulo} | Estado: ${resultados[i].tarea.estado}`);
        }

        let seleccion = parseInt(await input(`\nIngrese el numero de la tarea que desea ver (1 a ${resultados.length}): `), 10);
        while (isNaN(seleccion) || seleccion < 1 || seleccion > resultados.length) {
            seleccion = parseInt(await input(`\nIngrese un numero valido (1 a ${resultados.length}): `), 10);
        }

        const itemElegido = resultados[seleccion - 1];
        mostrarDetalleTarea(itemElegido.tarea, itemElegido.indiceOriginal);

        console.log("\nQue desea realizar?");
        let opcionRealizar = parseInt(await input("1- Editar Tarea | 2- Ver otro resultado | 3- Volver al menu: "), 10);
        while (isNaN(opcionRealizar) || opcionRealizar < 1 || opcionRealizar > 3) {
            opcionRealizar = parseInt(await input("1- Editar Tarea | 2- Ver otro resultado | 3- Volver al menu: "), 10);
        }

        if (opcionRealizar === 1) {
            await editarTareas(itemElegido.indiceOriginal);
            let seguir = parseInt(await input("\nDesea ver otro resultado? 1- Si | 2- Salir: "), 10);
            continuar = (seguir === 1) ? 1 : 2;
        } else if (opcionRealizar === 2) {
            continuar = 1;
        } else {
            continuar = 2;
        }
    } while (continuar === 1);
}

async function editarTareas(indice) {
    if (indice < 0 || indice >= tareas.length) {
        console.log(`\nError: El indice ${indice} no existe.`);
        return;
    }

    const copiaTarea = { ...tareas[indice] };

    console.log(`\nEditando tarea [${indice}]: "${copiaTarea.titulo}"`);
    let opEdita = parseInt(await input("1- Titulo | 2- Descripcion | 3- Estado | 4- Dificultad | 5- Fecha de vencimiento | 0- Salir: "), 10);
    while (isNaN(opEdita) || opEdita < 0 || opEdita > 5) {
        opEdita = parseInt(await input("Ingrese una respuesta valida (0 a 5): "), 10);
    }

    if (opEdita === 0) return;

    switch (opEdita) {
        case 1:
            let nuevoTitulo = await input("\nIngrese el nuevo titulo: ");
            while (!nuevoTitulo || nuevoTitulo.trim() === "") {
                nuevoTitulo = await input("\nEl titulo es obligatorio. Ingrese el nuevo titulo: ");
            }
            copiaTarea.titulo = nuevoTitulo;
            break;

        case 2:
            const nuevaDesc = await input("\nIngrese la nueva descripcion (Enter para dejar vacia): ");
            copiaTarea.descripcion = nuevaDesc.trim() === "" ? null : nuevaDesc;
            break;

        case 3:
            let nuevoEst = parseInt(await input("\nIngrese el nuevo estado: 1- PENDING | 2- IN-PROGRESS | 3- FINISHED | 4- CANCELED: "), 10);
            while (isNaN(nuevoEst) || nuevoEst < 1 || nuevoEst > 4) {
                nuevoEst = parseInt(await input("\nIngrese un estado valido (1 a 4): "), 10);
            }
            copiaTarea.estado = MAPA_ESTADOS[nuevoEst];
            break;

        case 4:
            let nuevaDif = parseInt(await input("\nIngrese la nueva dificultad: 1- Facil / 2- Media / 3- Dificil: "), 10);
            while (isNaN(nuevaDif) || nuevaDif < 1 || nuevaDif > 3) {
                nuevaDif = parseInt(await input("\nIngrese la dificultad correcta (1, 2 o 3): "), 10);
            }
            copiaTarea.dificultad = nuevaDif;
            break;

        case 5:
            const opVen = parseInt(await input("\n1- Ingresar nueva fecha | 2- Borrar fecha: "), 10);
            if (opVen === 2) {
                copiaTarea.vencimiento = null;
            } else {
                const nuevaFecha = await agregarVencimiento();
                copiaTarea.vencimiento = nuevaFecha instanceof Date ? nuevaFecha.toISOString() : (nuevaFecha ? String(nuevaFecha) : null);
            }
            break;
    }

    copiaTarea.ultimaEdicion = new Date().toISOString();

    if (validarTareas(copiaTarea)) {
        tareas[indice] = copiaTarea;
        await guardarTareasEnArchivo();
        console.log(`\nTarea en el indice ${indice} editada y guardada.`);
    } else {
        console.log("\nLos cambios ingresados no cumplen con el formato valido. No se guardaron los cambios.");
    }
}

module.exports = {
    cargarTareasDesdeArchivo,
    agregarTarea,
    verTareaspendientes,
    verTareasproceso,
    verTareascompletadas,
    verTareascanceladas,
    buscarTarea,
    editarTareas
};
