import React from 'react'

type View = 'vault' | 'profile'

interface NavbarProps {
    view: View
    onChange: (view: View) => void
    isConnected: boolean
    address?: string
}

const Navbar: React.FC<NavbarProps> = ({
    view,
    onChange,
}) => {
    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0rem 2rem',
                borderBottom: '1px solid #e5e7eb',
                height: '64px',
            }}
        >
            {/* Logo */}
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                🏦 My Vault
            </div>

            {/* Navegación */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => onChange('vault')}
                    style={{
                        fontWeight: view === 'vault' ? 'bold' : 'normal',
                        textDecoration: view === 'vault' ? 'underline' : 'none',
                        marginLeft: "1rem"
                    }}
                >
                    Vault
                </button>

                <button
                    onClick={() => onChange('profile')}
                    style={{
                        fontWeight: view === 'profile' ? 'bold' : 'normal',
                        textDecoration: view === 'profile' ? 'underline' : 'none'
                    }}
                >
                    Perfil
                </button>
            </div>

            {/* Wallet */}
            <div>
                <w3m-button style={{ marginLeft: '1rem' }} />
            </div>
        </nav>
    )
}

export default Navbar