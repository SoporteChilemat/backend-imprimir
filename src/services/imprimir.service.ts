import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import net from "node:net"

const { PDFDocument } = require('pdf-lib');

const writeFileAsync = promisify(fs.writeFile);

class CompraService {

    public async findGuiaFebos(folioguia: string) {
        const consultax = "folio,tipoDocumento";
        const rutEmpresa = "76008058-6"; // Reemplaza con el RUT de tu empresa
        const febosUrl = "https://api.febos.cl/produccion/v2/documentos";
        const token = "ZmYwNjNkYWUtYTliOS00MTE4LWI2NzQtODlkY2FmNWQzYWE5"; // Reemplaza con tu token
        const empresa = "76008058-6"; // Reemplaza con el RUT de tu empresa
        const filtrosx = `folio:${encodeURIComponent(folioguia)}|rutEmisor:${rutEmpresa}`;

        const headers = {
            'token': token,
            'empresa': empresa,
            'consulta': consultax,
            'filtros': filtrosx,
            'itemsPorPagina': '1',
            'orden': '-fechaCreacion',
            'pagina': '1'
        };

        try {
            const response = await fetch(febosUrl, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Aquí deberías procesar la respuesta y extraer el ID de Febos como necesites.
            const febosId = data; // Este es solo un ejemplo, ajusta según la estructura de tu respuesta.
            // console.log(febosId);

            const responseXML = await this.descargaPDFFebos(febosId);

            // Si necesitas interactuar con la base de datos, puedes hacerlo aquí.
            // Por ejemplo, guardar el febosId o realizar otra consulta relacionada.
            return { febosId, responseXML }; // Ajusta esto según lo que necesites retornar.
        } catch (error) {
            // console.error('Error fetching data from Febos API:', error);
            return { febosId: undefined, parseXMLtoDocumento: undefined }; // O maneja el error como prefieras.
        }
    }

    public async descargaPDFFebos(febosId: any) {

        console.log("febosId", febosId);
        console.log('febosId.documentos[0]', febosId.documentos[0]);

        const url = `https://api.febos.cl/produccion/documentos/${febosId.documentos[0].febosId}?json=no&imagen=si&incrustar=si&regenerar=no&tipoImagen=0&xml=no&xmlFirmado=no`;
        const rutEmpresa = "76008058-6"; // Reemplaza con el RUT de tu empresa
        const token = "ZmYwNjNkYWUtYTliOS00MTE4LWI2NzQtODlkY2FmNWQzYWE5"; // Reemplaza con tu token

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'empresa': rutEmpresa,
                    'token': token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const body = await response.json();  // Asumiendo que la respuesta es en formato JSON

            console.log(body);

            if (body.imagenData) {
                const pdfData = body.imagenData; // Decodificamos el PDF codificado en Base64
                console.log("PDF Content", pdfData);

                return pdfData;
            } else {
                console.error("No PDF data found in the response.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching PDF data: ", error);
        }
    }

    public async mandarImprimir(pdfBase64Data: any) {
        try {
            // Decodifica el archivo base64 a Buffer
            const originalPdfBuffer = Buffer.from(pdfBase64Data, 'base64');

            // Carga el documento PDF
            const originalPdfDoc = await PDFDocument.load(originalPdfBuffer);

            // Crea un nuevo documento PDF y agrega solo la primera página
            const pdfDoc = await PDFDocument.create();
            const [firstPage] = await pdfDoc.copyPages(originalPdfDoc, [0]);
            pdfDoc.addPage(firstPage);

            // Serializa el nuevo PDF
            const pdfBuffer = await pdfDoc.save();

            const printerHost = '192.168.5.160';
            const printerPort = 9100;
            
            for (let i = 0; i < 3; i++) {
                const client = net.createConnection({ host: printerHost, port: printerPort }, async () => {
                    console.log('Conexión establecida con la impresora.');

                    // Envía la primera página 3 veces

                    client.write(pdfBuffer);
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Envía el comando de finalización de impresión
                    const endData = Buffer.from('\x1B%-12345X@PJL EOJ\n\x1B%-12345X');
                    client.write(endData);

                    // Cierra la conexión
                    client.end();
                });

                client.on('end', () => {
                    console.log('Conexión cerrada con la impresora.');
                });

                client.on('error', (err) => {
                    console.error('Error de conexión:', err);
                });
            }
        } catch (error) {
            console.error("Error al imprimir PDF:", error);
            throw new Error("Error al imprimir PDF");
        }
    }
}

export default CompraService;
