const { input } = require("./nodeImperativo");

async function menuPrincipal() {
    console.log("\nMenu Principal");
    console.log("1. Ver mis tareas");
    console.log("2. Agregar una tarea");
    console.log("3. Buscar una tarea");
    console.log("0. Salir");

    let opcion = parseInt(await input("\nSeleccione una opcion: "), 10);
    while (isNaN(opcion) || opcion < 0 || opcion > 3) {
        opcion = parseInt(await input("Ingrese una opcion valida (0 a 3): "), 10);
    }
    return opcion;
}

async function menuVertareas() {
    console.log("\nQue tareas deseas ver?");
    console.log("1. Pendientes");
    console.log("2. En curso");
    console.log("3. Terminadas");
    console.log("4. Canceladas");
    console.log("0. Volver al menu principal");

    let opcion = parseInt(await input("\nSeleccione una opcion: "), 10);
    while (isNaN(opcion) || opcion < 0 || opcion > 4) {
        opcion = parseInt(await input("Ingrese una opcion valida (0 a 4): "), 10);
    }
    return opcion;
}

module.exports = { menuPrincipal, menuVertareas };
