import React, { useState } from "react"
import { useAppKit } from "@reown/appkit/react"

export type View = "vault" | "stocks" | "profile" | "faucet"

interface NavbarProps {
    view: View
    isConnected: boolean
    address?: string
    onNavigate: (view: View) => void
}

const NAV_ITEMS: View[] = ["vault", "stocks", "faucet", "profile"]

const Navbar: React.FC<NavbarProps> = ({
    view,
    onNavigate,
    isConnected,
    address,
}) => {
    const { open } = useAppKit()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleNavigate = (v: View) => {
        setMobileOpen(false)
        onNavigate(v)
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background-dark/80 border-b border-white/5">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                {/* LOGO */}
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="text-lg">🐓</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight">
                        Gallito DeFi
                    </span>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-10">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item}
                            onClick={() => onNavigate(item)}
                            className={`text-sm font-medium transition-colors ${view === item
                                ? "text-primary"
                                : "hover:text-primary"
                                }`}
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </button>
                    ))}
                </nav>

                {/* RIGHT ACTIONS (DESKTOP) */}
                <div className="hidden md:flex items-center gap-4">
                    <a
                        href="https://github.com/usainbluntmx/rwa-yield-vault"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2 rounded-full text-sm font-semibold transition-all"
                    >
                        Docs
                    </a>

                    {isConnected && address && (
                        <button
                            onClick={() => open({ view: "Account" })}
                            className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
                        >
                            <span className="text-slate-300">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </span>
                            <span className="text-primary font-semibold">
                                Disconnect
                            </span>
                        </button>
                    )}
                </div>

                {/* MOBILE BUTTON */}
                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                >
                    <span className="text-xl">☰</span>
                </button>
            </div>

            {/* MOBILE MENU */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 bg-background-dark/95 backdrop-blur-xl">
                    <div className="px-4 py-6 flex flex-col gap-4">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigate(item)}
                                className={`text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${view === item
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-white/5"
                                    }`}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </button>
                        ))}

                        <div className="h-px bg-white/10 my-2" />

                        <a
                            href="https://github.com/usainbluntmx/rwa-yield-vault"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-semibold"
                        >
                            Docs
                        </a>

                        {isConnected && address && (
                            <button
                                onClick={() => {
                                    setMobileOpen(false)
                                    open({ view: "Account" })
                                }}
                                className="px-4 py-3 rounded-lg bg-primary/10 text-primary font-semibold text-sm"
                            >
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
