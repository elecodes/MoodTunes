import { useState, useRef } from 'react';
import styles from './AuthForm.module.css';
import { authService } from '../../services/authService.js';

/**
 * AuthForm Component
 * 
 * Implements a professional registration form with:
 * - Strict A11y (labels, ARIA, focus management)
 * - Progressive validation (onBlur)
 * - Performance/Feedback (100ms rule)
 * - Security best practices (Show/Hide password)
 */
export default function AuthForm({ onSubmit }) {
  const [isLogin, setIsLogin] = useState(false); // Toggle State  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: null,
    password: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Unique IDs for accessibility
  const emailId = "auth-email";
  const passwordId = "auth-password";
  const emailErrorId = "auth-email-error";
  const passwordErrorId = "auth-password-error";

  const validateField = (name, value) => {
    let error = null;
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        error = "El correo electrónico es obligatorio.";
      } else if (!emailRegex.test(value)) {
        error = "Formato inválido. Ejemplo esperado: usuario@dominio.com";
      }
    } else if (name === 'password') {
      if (!value) {
        error = "La contraseña es obligatoria.";
      } else if (!isLogin && value.length < 8) {
        error = "La contraseña debe tener al menos 8 caracteres.";
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error immediately when user starts correcting (Progressive Validation)
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur to avoid interrupting user while typing
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };



// ... (other imports)

// ... inside function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      setTouched({ email: true, password: true });
      return;
    }

    // 100ms rule: Immediate visual feedback
    setIsSubmitting(true);
    
    try {
        let response;
        if (isLogin) {
            response = await authService.login(formData);
        } else {
            response = await authService.register({
                ...formData,
                username: formData.email.split('@')[0]
            });
        }
        
        if (onSubmit) {
            // Pass the user/token data up
            await onSubmit(response.data); 
        }
    } catch (err) {
        // Handle API errors
        if (err.details && err.details.length > 0) {
            // Map backend validation errors to field errors
            const newErrors = { ...errors };
            err.details.forEach(detail => {
                if (detail.field === 'email') newErrors.email = detail.message;
                if (detail.field === 'password') newErrors.password = detail.message;
            });
            setErrors(newErrors);
        } else {
            // Generic error (alert for now, could be a toast)
            alert(err.message || "Registration failed. Please try again.");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className={styles.formGroup}>
          <label htmlFor={emailId} className={styles.label}>
            Correo Electrónico
          </label>
          <div className={styles.inputWrapper}>
            <input
              id={emailId}
              name="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? emailErrorId : undefined}
            />
          </div>
          {errors.email && (
            <div id={emailErrorId} className={styles.errorMessage} role="alert">
              <span aria-hidden="true">⚠️</span>
              {errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className={styles.formGroup}>
          <label htmlFor={passwordId} className={styles.label}>
            Contraseña
          </label>
          <div className={styles.inputWrapper}>
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete={isLogin ? "current-password" : "new-password"}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? passwordErrorId : undefined}
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <div id={passwordErrorId} className={styles.errorMessage} role="alert">
              <span aria-hidden="true">⚠️</span>
              {errors.password}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner} aria-hidden="true"></div>
              <span>Procesando...</span>
            </>
          ) : (
            isLogin ? 'Entrar' : 'Crear Cuenta'
          )}
        </button>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <button 
                type="button" 
                onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({ email: null, password: null }); // Clear errors
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color, #646cff)', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
        </div>
      </form>
    </div>
  );
}
