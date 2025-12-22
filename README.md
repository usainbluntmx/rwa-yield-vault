--------------------------------------------------

🏦 RWA Yield Vault – Mantle Network

📌 Resumen

RWA Yield Vault es una dApp simple y funcional desplegada sobre Mantle Sepolia Testnet que permite a los usuarios depositar y retirar el token nativo MNT de forma segura, transparente y no custodial.

El proyecto está diseñado como un bloque base (building block) para futuros productos RealFi / RWA, donde los depósitos podrían representar exposición a activos del mundo real o estrategias de yield reguladas.

Este MVP prioriza funcionalidad real y confiabilidad, evitando simulaciones o features cosméticas.

--------------------------------------------------

🎯 Problema que resuelve

En el ecosistema RealFi y RWA, muchos proyectos:

- Prometen yield sin mecanismos claros
- No muestran estados reales on-chain
- Tienen UX frágil (errores silenciosos, balances incorrectos)
- No permiten control granular del capital

RWA Yield Vault resuelve esto proporcionando:

- Control total del usuario sobre sus fondos
- Depósitos y retiros parciales
- Balance reflejado directamente desde el contrato
- Integración nativa con Mantle (bajo costo y alta eficiencia)

--------------------------------------------------

🧩 Solución

Una bóveda (vault) on-chain donde:

- Los usuarios depositan MNT
- El contrato mantiene un balance individual por usuario
- Los usuarios pueden retirar cualquier monto parcial cuando lo deseen
- La UI refleja el estado real del contrato en todo momento

El diseño es intencionalmente simple para:

- facilitar auditoría
- reducir superficie de ataque
- servir como base para futuras extensiones (yield, RWA, compliance)

--------------------------------------------------

⚙️ Cómo funciona

1. Conexión de wallet

- Detección automática de MetaMask
- Cambio automático a Mantle Sepolia Testnet

2. Depósito

- El usuario ingresa un monto en MNT
- Confirma la transacción
- El contrato recibe los fondos
- El balance se actualiza desde la blockchain

3. Retiro

- El usuario ingresa el monto a retirar
- Puede ser parcial o total
- El contrato transfiere los fondos directamente al usuario
- El balance restante se refleja correctamente

--------------------------------------------------

🛠️ Stack tecnológico

Smart Contracts

- Solidity ^0.8.20
- Hardhat
- ethers.js v6
- Tests unitarios incluidos

Frontend

- Vite
- React + TypeScript
- ethers.js
- MetaMask (EIP-1193)

Blockchain

- Mantle Sepolia Testnet
- Token nativo: MNT

--------------------------------------------------

📜 Contrato desplegado

- Red: Mantle Sepolia Testnet
- Dirección:

0xcE9A8305391747f8bF34B18Ae37a434c59060Ce2

- Explorer:

https://sepolia.mantlescan.xyz/address/0xcE9A8305391747f8bF34B18Ae37a434c59060Ce2

--------------------------------------------------

🚀 Cómo probar el proyecto

Requisitos

- MetaMask
- MNT de prueba (Mantle Sepolia faucet)

Pasos

1.Clona el repositorio

git clone https://github.com/tu-usuario/rwa-yield-vault
cd rwa-yield-vault/frontend

2. Instala dependencias

npm install

3. Ejecuta el frontend

npm run dev

4. Abre la app, conecta tu wallet y prueba:

- Depositar MNT
- Retirar MNT (parcial o total)

--------------------------------------------------

🧪 Tests

El contrato incluye tests unitarios que validan:

- Depósitos correctos
- Acumulación de balance por usuario
- Retiros parciales y totales

Ejecutar tests:

npx hardhat test

--------------------------------------------------

🔐 Consideraciones de seguridad

- Proyecto no custodial
- No se manejan claves privadas
- No se utilizan permisos administrativos
- El MVP no genera yield real aún
- El diseño está pensado para ser extendido con módulos auditables

--------------------------------------------------

🗺️ Roadmap

Corto plazo

- Eventos on-chain → actualización automática del UI
- Botón "Withdraw Max"

Mediano plazo

- Integración de yield (simulado o real)
- Módulo RWA (bonos, facturas, real estate tokenizado)
- Pruebas de estrés y auditoría

Largo plazo

- Compliance-ready flows (KYC / ZK-KYC)
- Distribución de yield regulada
- Integración con oráculos y proveedores off-chain

--------------------------------------------------

🧠 Por qué Mantle

Mantle ofrece:

- Bajo costo de transacción
- Alta compatibilidad EVM
- Infraestructura modular ideal para RealFi
- Excelente UX para aplicaciones financieras reales

Este proyecto aprovecha esas ventajas para construir una base sólida y escalable.

--------------------------------------------------

👥 Equipo

- Desarrollador: Ricardo Fuentes
- Contacto: j.ricardo.df@gmail.com

--------------------------------------------------

📄 Licencia

- MIT

--------------------------------------------------
