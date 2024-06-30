import React, { useState, useEffect } from "react";
import HistorialModal from "../Modales/HistorialModal";
import "./Habitaciones.css";

export function Datos({ funcionesFoco }) {
  const {
    FocoPrendidoBaño,
    FocoPrendidoCocina,
    FocoPrendidoCuarto,
    FocoPrendidoSala,
    FocoPrendidoCochera,
  } = funcionesFoco;

  const [estadoBaño, setEstadoBaño] = useState(false);
  const [estadoCocina, setEstadoCocina] = useState(false);
  const [estadoCuarto, setEstadoCuarto] = useState(false);
  const [estadoSala, setEstadoSala] = useState(false);
  const [estadoCochera, setEstadoCochera] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }

    const eventSource = new EventSource("http://localhost:3030/api/v1/lightfocus/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.id) {
        case 2:
          setEstadoBaño(data.estado);
          break;
        case 5:
          setEstadoCocina(data.estado);
          break;
        case 4:
          setEstadoCuarto(data.estado);
          break;
        case 1:
          setEstadoSala(data.estado);
          break;
        case 3:
          setEstadoCochera(data.estado);
          break;
        default:
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error("Error con el EventSource:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const toggleLight = async (id, estado, setEstado, encenderFuncion, apagarFuncion) => {
    if (loading) return;
    setLoading(true);

    const url = estado
      ? `http://localhost:3030/api/v1/lightfocus/turn-off/${id}`
      : `http://localhost:3030/api/v1/lightfocus/turn-on/${id}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        if (estado) {
          apagarFuncion();
        } else {
          encenderFuncion();
        }
        setEstado(!estado);
        console.log(`Foco ${id} cambiado a: ${estado ? "off" : "on"}`);
      } else {
        console.error(`Error al ${estado ? "apagar" : "encender"} el foco:`, response.status);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (token) {
      setShowModal(true);
    } else {
      alert("No tienes permisos para ver el historial.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <section className="SeparacionDatos">
      <div className="Historial">
        <div className="LetraHistorial">
          <p className="LetraHistorial">Control</p>
        </div>
        <div>
          <button className="Bootoon" onClick={openModal}>
            Historial
          </button>
        </div>
      </div>
      <div className="Control">
        <button
          className={`Botoon ${estadoBaño ? "activo" : "inactivo"}`}
          onClick={() =>
            toggleLight(2, estadoBaño, setEstadoBaño, FocoPrendidoBaño, () => {})
          }
        >
          FocoBaño
        </button>

        <button
          className={`Botoon ${estadoCocina ? "activo" : "inactivo"}`}
          onClick={() =>
            toggleLight(5, estadoCocina, setEstadoCocina, FocoPrendidoCocina, () => {})
          }
        >
          FocoCocina
        </button>

        <button
          className={`Botoon ${estadoCuarto ? "activo" : "inactivo"}`}
          onClick={() =>
            toggleLight(4, estadoCuarto, setEstadoCuarto, FocoPrendidoCuarto, () => {})
          }
        >
          FocoCuarto
        </button>

        <button
          className={`Botoon ${estadoSala ? "activo" : "inactivo"}`}
          onClick={() =>
            toggleLight(1, estadoSala, setEstadoSala, FocoPrendidoSala, () => {})
          }
        >
          FocoSala
        </button>

        <button
          className={`Botoon ${estadoCochera ? "activo" : "inactivo"}`}
          onClick={() =>
            toggleLight(3, estadoCochera, setEstadoCochera, FocoPrendidoCochera, () => {})
          }
        >
          FocoCochera
        </button>
      </div>

      <HistorialModal showModal={showModal} closeModal={closeModal} token={token} />
    </section>
  );
}
