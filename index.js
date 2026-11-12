const {
    cargarTareasDesdeArchivo,
    agregarTarea,
    verTareaspendientes,
    verTareasproceso,
    verTareascompletadas,
    verTareascanceladas,
    buscarTarea
} = require("./src/data/servicios/gestorTarea");
const { close } = require("./src/data/utilidades/nodeImperativo");
const { menuPrincipal, menuVertareas } = require("./src/data/utilidades/mostrarMenus");

async function main() {
    await cargarTareasDesdeArchivo();

    let salir = false;
    while (!salir) {
        const opcionMenu = await menuPrincipal();
        switch (opcionMenu) {
            case 0:
                salir = true;
                console.log("\nSaliendo del gestor de tareas...");
                break;

            case 1:
                const opMenuverTareas = await menuVertareas();
                switch (opMenuverTareas) {
                    case 0:
                        break;
                    case 1:
                        await verTareaspendientes();
                        break;
                    case 2:
                        await verTareasproceso();
                        break;
                    case 3:
                        await verTareascompletadas();
                        break;
                    case 4:
                        await verTareascanceladas();
                        break;
                    default:
                        console.log("Ingrese una respuesta valida.");
                }
                break;

            case 2:
                await agregarTarea();
                break;

            case 3:
                await buscarTarea();
                break;
        }
    }
    close();
}

main();
