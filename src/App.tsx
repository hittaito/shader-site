import "./App.css";
import { MengerSponge } from "./pages/mengerSponge/MengerSponge";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { JuliaSet } from "./pages/juliaSet/juliaSet";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { Button, ListGroup, Offcanvas } from "react-bootstrap";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Canvas>
        <Routes>
          <Route path="/menger-sponge" element={<MengerSponge />} />
          <Route path="/julia-set" element={<JuliaSet />} />
          <Route path="*" element={<Navigate replace to="/menger-sponge" />} />
        </Routes>
        <Perf position="top-left" />
      </Canvas>
      {/* @ts-ignore  */}
      <Button className="launch-btn" onClick={handleShow}>
        Navi
      </Button>

      <Offcanvas data-bs-theme="dark" show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup>
            <ListGroup.Item>
              <Link to="/menger-sponge">Menger Sponge</Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <Link to="/julia-set">Julia Set</Link>
            </ListGroup.Item>
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default App;
