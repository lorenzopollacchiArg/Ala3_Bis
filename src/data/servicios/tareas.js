class Tarea {
    constructor(
        titulo,
        descripcion = null,
        estado = "PENDING",
        dificultad = 1,
        vencimiento = null,
        creacion = new Date().toISOString(),
        ultimaEdicion = null
    ) {
        this.titulo = titulo;
        this.descripcion = descripcion && descripcion.trim() !== "" ? descripcion : null;
        this.estado = estado;
        this.creacion = creacion;
        this.ultimaEdicion = ultimaEdicion;
        this.vencimiento = vencimiento;
        this.dificultad = dificultad;
    }
}

module.exports = Tarea;
