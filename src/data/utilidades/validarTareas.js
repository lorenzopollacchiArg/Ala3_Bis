const estadosValidos = ["PENDING", "IN-PROGRESS", "FINISHED", "CANCELED"];
const dificultadValida = [1, 2, 3];

function fechaValida(fechaStr) {
    return typeof fechaStr === "string" && !isNaN(Date.parse(fechaStr));
}

function validarTareas(tarea) {
    if (!tarea || typeof tarea !== "object" || Array.isArray(tarea)) {
        return false;
    }

    if (typeof tarea.titulo !== "string" || tarea.titulo.trim() === "") {
        return false;
    }

    if (tarea.descripcion !== null && typeof tarea.descripcion !== "string") {
        return false;
    }

    if (!estadosValidos.includes(tarea.estado)) {
        return false;
    }

    if (!fechaValida(tarea.creacion)) {
        return false;
    }

    if (tarea.ultimaEdicion !== null && !fechaValida(tarea.ultimaEdicion)) {
        return false;
    }

    if (tarea.vencimiento !== null && !fechaValida(tarea.vencimiento)) {
        return false;
    }

    if (!dificultadValida.includes(tarea.dificultad)) {
        return false;
    }

    return true;
}

module.exports = { validarTareas };
