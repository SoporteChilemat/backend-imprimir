import { db } from "../utils/db.server";

export async function actualizarEstadoGuia(folio: number, nuevoEstado: number) {
    try {
        const guiaActualizada = await db.guiaReimprimir.update({
            where: {
                folio: folio
            },
            data: {
                estado: nuevoEstado
            }
        });
        console.log('Guía actualizada:', guiaActualizada);
        return guiaActualizada;
    } catch (error) {
        console.error("Error al obtener los locales y sus guías relacionadas:", error);
        throw error;
    }
}