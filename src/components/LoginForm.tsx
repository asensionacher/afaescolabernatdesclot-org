'use client'

import { useState } from 'react'
import { login } from '@/lib/auth'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(password)
      
      if (success) {
        window.location.reload()
      } else {
        setError('Contrasenya incorrecta')
        setPassword('')
      }
    } catch (err) {
      setError('Error en iniciar sessió')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Partes de Reunió</h1>
        <p className={styles.subtitle}>Introdueix la contrasenya per accedir</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasenya"
            className={styles.input}
            disabled={loading}
            required
          />
          
          {error && <p className={styles.error}>{error}</p>}
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Verificant...' : 'Accedir'}
          </button>
        </form>
      </div>
    </div>
  )
}
