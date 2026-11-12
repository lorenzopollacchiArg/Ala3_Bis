const { input } = require("./nodeImperativo");

async function agregarVencimiento() {
    let anio = parseInt(await input("Ingrese el anio de vencimiento (ej. 2026): "), 10);
    while (isNaN(anio) || anio < 2000 || anio > 2100) {
        anio = parseInt(await input("Anio invalido. Ingrese nuevamente: "), 10);
    }

    let mes = parseInt(await input("Ingrese el mes (1 a 12): "), 10);
    while (isNaN(mes) || mes < 1 || mes > 12) {
        mes = parseInt(await input("Mes invalido. Ingrese un valor entre 1 y 12: "), 10);
    }

    let dia = parseInt(await input("Ingrese el dia (1 a 31): "), 10);
    while (isNaN(dia) || dia < 1 || dia > 31) {
        dia = parseInt(await input("Dia invalido. Ingrese un valor entre 1 y 31: "), 10);
    }

    const fecha = new Date(anio, mes - 1, dia);
    if (isNaN(fecha.getTime())) {
        return null;
    }
    return fecha.toISOString();
}

module.exports = { agregarVencimiento };
