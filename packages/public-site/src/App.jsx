import React from 'react'
import './App.css'

function App() {
    return (
        <div className="public-site">
            <header className="header">
                <h1>💅 Bem-vindo ao Agendamento Online</h1>
                <p>Escolha um serviço e horário</p>
            </header>

            <main className="main-content">
                <div className="professional-card">
                    <div className="avatar">P</div>
                    <h2>Nome do Profissional</h2>
                    <p className="profession">Manicure & Pedicure</p>
                    <div className="rating">⭐⭐⭐⭐⭐ 4.9 (86 avaliações)</div>
                </div>

                <div className="services-list">
                    <h3>Serviços Disponíveis</h3>
                    <div className="service-item">
                        <span className="service-name">Manicure Completa</span>
                        <span className="service-price">R$ 45</span>
                    </div>
                    <div className="service-item">
                        <span className="service-name">Pedicure</span>
                        <span className="service-price">R$ 50</span>
                    </div>
                    <div className="service-item">
                        <span className="service-name">Alongamento</span>
                        <span className="service-price">R$ 80</span>
                    </div>
                </div>

                <button className="book-button">
                    📅 Agendar Horário
                </button>
            </main>

            <footer className="footer">
                <p>Agendamento via <strong>EstetiOne</strong></p>
            </footer>
        </div>
    )
}

export default App