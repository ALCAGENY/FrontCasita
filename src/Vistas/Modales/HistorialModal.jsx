import React, { useEffect, useState } from "react";
import "../../Vistas/Modales/Modal.css";

const HistorialModal = ({ showModal, closeModal }) => {
  const [historial, setHistorial] = useState([]);
  const [userId, setUserId] = useState(null); // Estado para almacenar el ID del usuario

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // Extraer el ID de usuario del token
      const decodedToken = parseJwt(storedToken);
      if (decodedToken) {
        setUserId(decodedToken.id);
      }
    }
  }, []);

  useEffect(() => {
    if (showModal && userId !== null && userId !== 3 && userId !== 4) {
      const source = new EventSource("http://localhost:3030/api/v1/lightfocus/events");

      source.addEventListener('lightfocus', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(data); // Verifica los datos recibidos en la consola
          if (data.historial) {
            setHistorial((prevHistorial) => [...prevHistorial, ...data.historial]);
          } else {
            setHistorial((prevHistorial) => [...prevHistorial, data]);
          }
        } catch (error) {
          console.error('Error al parsear JSON:', error);
        }
      });

      source.addEventListener('lightfocus-history', (event) => {
        try {
          const historyData = JSON.parse(event.data);
          console.log(historyData);
          if (Array.isArray(historyData.historial)) {
            setHistorial((prevHistorial) => [...prevHistorial, ...historyData.historial]);
          } else {
            console.error('Error: historial no es un arreglo');
          }
        } catch (error) {
          console.error('Error al parsear JSON:', error);
        }
      });

      source.onerror = (event) => {
        console.error('Error de SSE:', event);
      };

      return () => {
        source.close();
      };
    }
  }, [showModal, userId]);

  const enviarHistorialPorCorreo = async () => {
    try {
      const response = await fetch("http://localhost:3030/api/v1/lightfocus/send-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        alert("Historial enviado por correo exitosamente");
      } else {
        console.error("Error al enviar el historial por correo:", response.status);
        alert("Error al enviar el historial por correo");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Error al realizar la solicitud");
    }
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  return (
    <div className={`modal ${showModal && userId !== 3 && userId !== 4 ? "show" : "hide"}`}>
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <div className="Datos">
          <div className="Enviar">
            <h2>Historial de Acciones de Focos</h2>
            {userId !== 3 && userId !== 4 && (
              <button className="Enviar1" onClick={enviarHistorialPorCorreo}>Enviar Historial</button>
            )}
          </div>
          <table className="Tabla">
            <thead>
              <tr>
                <th>Luz</th>
                <th>Estado</th>
                <th>Realizado por</th>
                <th>Encendido</th>
                <th>Apagado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr key={index}>
                  <td className="name">{item.name}</td>
                  <td className={item.status === 'on' ? 'status-on' : 'status-off'}>
                    <button>{item.status === 'on' ? 'Encendido' : 'Apagado'}</button>
                  </td>
                  <td>{item.userName} ({item.userRole})</td>
                  <td>{new Date(item.timeTurnedOn).toLocaleString()}</td>
                  <td>{new Date(item.timeTurnedOff).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialModal;
