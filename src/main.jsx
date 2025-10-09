import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Inicio from './inicio.jsx'
import React from "react";
import ReactDOM from "react-dom/client";
import RegisterPage from './RegisterPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Inicio /> */}
<RegisterPage/>
    {/* <App /> */}

  </StrictMode>,
)
