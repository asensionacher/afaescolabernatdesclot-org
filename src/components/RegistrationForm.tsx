'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import SignatureModal from './SignatureModal';
import styles from './RegistrationForm.module.css';

interface Student {
  id: string;
  name: string;
  surname: string;
  catsalut: string;
  grade: string;
}

interface FormData {
  guardian1Name: string;
  guardian1Dni: string;
  guardian1Email: string;
  guardian1Phone: string;
  guardian2Name: string;
  guardian2Dni: string;
  guardian2Email: string;
  guardian2Phone: string;
  address: string;
  number: string;
  floor: string;
  postalCode: string;
  city: string;
  province: string;
  students: Student[];
  paymentReceipt?: File;
  acceptData: boolean;
}

export default function RegistrationForm({ locale }: { locale: string }) {
  const t = useTranslations('registration');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'validation-error'>('idle');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    guardian1Name: '',
    guardian1Dni: '',
    guardian1Email: '',
    guardian1Phone: '',
    guardian2Name: '',
    guardian2Dni: '',
    guardian2Email: '',
    guardian2Phone: '',
    address: '',
    number: '',
    floor: '',
    postalCode: '',
    city: '',
    province: '',
    students: [
      {
        id: '1',
        name: '',
        surname: '',
        catsalut: '',
        grade: ''
      }
    ],
    acceptData: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate dynamic payment concept
  const paymentConcept = useMemo(() => {
    // Get first student's surname(s) - could be one or two surnames
    const firstStudent = formData.students[0];
    const studentSurnames = firstStudent?.surname.trim() || '';
    
    // Get all students' grades
    const grades = formData.students
      .map(s => s.grade.trim())
      .filter(g => g !== '')
      .join(' ');
    
    // Check if we have enough data for a dynamic concept
    // We need at least the student surname(s) and at least one grade
    const hasEnoughData = studentSurnames && grades;
    
    if (hasEnoughData) {
      // Format: QUOTA AFA 2025-2026 SURNAME1 SURNAME2 GRADE1 GRADE2 ...
      // The surname field can contain one or two surnames
      return `QUOTA AFA 2025-2026 ${studentSurnames} ${grades}`;
    }
    
    // Return null to show default example
    return null;
  }, [formData.students]);

  const addStudent = () => {
    setFormData({
      ...formData,
      students: [
        ...formData.students,
        {
          id: Date.now().toString(),
          name: '',
          surname: '',
          catsalut: '',
          grade: ''
        }
      ]
    });
  };

  const removeStudent = (id: string) => {
    if (formData.students.length > 1) {
      setFormData({
        ...formData,
        students: formData.students.filter(s => s.id !== id)
      });
    }
  };

  const updateStudent = (id: string, field: keyof Student, value: string) => {
    setFormData({
      ...formData,
      students: formData.students.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      )
    });

    // Real-time validation for CATSALUT
    if (field === 'catsalut' && value.trim()) {
      const studentIndex = formData.students.findIndex(s => s.id === id);
      if (!validateCatsalut(value)) {
        setErrors(prev => ({ ...prev, [`student${studentIndex}Catsalut`]: t('invalidCatsalut') }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`student${studentIndex}Catsalut`];
          return newErrors;
        });
      }
    }
  };

  // Real-time validation handler
  const handleFieldChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });

    // Clear general validation error when user starts fixing
    if (submitStatus === 'validation-error') {
      setSubmitStatus('idle');
    }

    // Clear error when user starts typing
    if (typeof value === 'string' && value.trim()) {
      // Validate in real-time
      let error = '';
      
      if (field === 'guardian1Email' || field === 'guardian2Email') {
        if (!validateEmail(value)) {
          error = t('invalidEmail');
        }
      } else if (field === 'guardian1Phone' || field === 'guardian2Phone') {
        if (!validatePhone(value)) {
          error = t('invalidPhone');
        }
      } else if (field === 'guardian1Dni' || field === 'guardian2Dni') {
        if (!validateDni(value)) {
          error = t('invalidDni');
        }
      }

      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    // Custom email regex pattern
    return /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^[0-9]{9}$/.test(phone.replace(/\s/g, ''));
  };

  const validateDni = (dni: string): boolean => {
    // DNI: 8 digits + letter (12345678A)
    // NIE: Letter (X, Y, Z) + 7 digits + letter (X1234567A)
    return /^[0-9]{8}[A-Za-z]$|^[XYZxyz][0-9]{7}[A-Za-z]$/.test(dni.trim());
  };

  const validateCatsalut = (catsalut: string): boolean => {
    // Format: 4 letters + 10 numbers (AAAA1234567890)
    return /^[A-Za-z]{4}[0-9]{10}$/.test(catsalut.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Guardian 1 validation (required)
    if (!formData.guardian1Name.trim()) {
      newErrors.guardian1Name = t('required');
    }
    if (!formData.guardian1Dni.trim()) {
      newErrors.guardian1Dni = t('required');
    } else if (!validateDni(formData.guardian1Dni)) {
      newErrors.guardian1Dni = t('invalidDni');
    }
    if (!formData.guardian1Email.trim()) {
      newErrors.guardian1Email = t('required');
    } else if (!validateEmail(formData.guardian1Email)) {
      newErrors.guardian1Email = t('invalidEmail');
    }
    if (!formData.guardian1Phone.trim()) {
      newErrors.guardian1Phone = t('required');
    } else if (!validatePhone(formData.guardian1Phone)) {
      newErrors.guardian1Phone = t('invalidPhone');
    }

    // Guardian 2 validation (optional, but if provided must be valid)
    if (formData.guardian2Dni.trim() && !validateDni(formData.guardian2Dni)) {
      newErrors.guardian2Dni = t('invalidDni');
    }
    if (formData.guardian2Email.trim() && !validateEmail(formData.guardian2Email)) {
      newErrors.guardian2Email = t('invalidEmail');
    }
    if (formData.guardian2Phone.trim() && !validatePhone(formData.guardian2Phone)) {
      newErrors.guardian2Phone = t('invalidPhone');
    }

    // Address validation (required)
    if (!formData.address.trim()) {
      newErrors.address = t('required');
    }
    if (!formData.number.trim()) {
      newErrors.number = t('required');
    }
    if (!formData.floor.trim()) {
      newErrors.floor = t('required');
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t('required');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('required');
    }
    if (!formData.province.trim()) {
      newErrors.province = t('required');
    }

    // Students validation (at least one required)
    formData.students.forEach((student, index) => {
      if (!student.name.trim()) {
        newErrors[`student${index}Name`] = t('required');
      }
      if (!student.surname.trim()) {
        newErrors[`student${index}Surname`] = t('required');
      }
      if (!student.catsalut.trim()) {
        newErrors[`student${index}Catsalut`] = t('required');
      } else if (!validateCatsalut(student.catsalut)) {
        newErrors[`student${index}Catsalut`] = t('invalidCatsalut');
      }
      if (!student.grade) {
        newErrors[`student${index}Grade`] = t('required');
      }
    });

    // Data protection acceptance
    if (!formData.acceptData) {
      newErrors.acceptData = t('mustAcceptData');
    }

    // Payment receipt validation (now required)
    if (!formData.paymentReceipt) {
      newErrors.paymentReceipt = t('required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed. Errors:', errors);
      setSubmitStatus('validation-error');
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    console.log('Validation passed, opening signature modal...');
    // Open signature modal instead of submitting directly
    setShowSignatureModal(true);
  };

  const handleSignatureConfirm = async (signature: string) => {
    setSignatureDataUrl(signature);
    setShowSignatureModal(false);
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields as JSON string
      formDataToSend.append('data', JSON.stringify({
        guardian1Name: formData.guardian1Name,
        guardian1Dni: formData.guardian1Dni,
        guardian1Email: formData.guardian1Email,
        guardian1Phone: formData.guardian1Phone,
        guardian2Name: formData.guardian2Name,
        guardian2Dni: formData.guardian2Dni,
        guardian2Email: formData.guardian2Email,
        guardian2Phone: formData.guardian2Phone,
        address: formData.address,
        number: formData.number,
        floor: formData.floor,
        postalCode: formData.postalCode,
        city: formData.city,
        province: formData.province,
        students: formData.students,
        acceptData: formData.acceptData,
        locale
      }));
      
      // Add payment receipt file
      if (formData.paymentReceipt) {
        formDataToSend.append('paymentReceipt', formData.paymentReceipt);
      }

      // Add signature
      formDataToSend.append('signature', signature);

      console.log('Sending form data...');
      
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('Form submitted successfully');
        
        // Download PDF for user
        const result = await response.json();
        if (result.pdfBase64) {
          const link = document.createElement('a');
          link.href = `data:application/pdf;base64,${result.pdfBase64}`;
          link.download = result.filename || 'inscripcion_afa.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        setSubmitStatus('success');
        // Reset form
        setFormData({
          guardian1Name: '',
          guardian1Dni: '',
          guardian1Email: '',
          guardian1Phone: '',
          guardian2Name: '',
          guardian2Dni: '',
          guardian2Email: '',
          guardian2Phone: '',
          address: '',
          number: '',
          floor: '',
          postalCode: '',
          city: '',
          province: '',
          students: [{ id: '1', name: '', surname: '', catsalut: '', grade: '' }],
          acceptData: false,
          paymentReceipt: undefined
        });
        setSignatureDataUrl(null);
        
        // Clear file input
        const fileInput = document.getElementById('receipt') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error:', errorData);
        alert(`Error: ${errorData.error || 'Error desconocido al enviar el formulario'}`);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error de red: ${error instanceof Error ? error.message : 'No se pudo conectar con el servidor'}`);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const grades = ['I3', 'I4', 'I5', '1', '2', '3', '4', '5', '6'];

  // Development helper: Fill form with test data
  const fillTestData = () => {
    setFormData({
      guardian1Name: 'Joan Garcia López',
      guardian1Dni: '12345678A',
      guardian1Email: 'joan.garcia@example.com',
      guardian1Phone: '600123456',
      guardian2Name: 'Maria Pérez Sánchez',
      guardian2Dni: '87654321B',
      guardian2Email: 'maria.perez@example.com',
      guardian2Phone: '600654321',
      address: 'Carrer de Provença',
      number: '123',
      floor: '2º 1ª',
      postalCode: '08908',
      city: 'Hospitalet de Llobregat',
      province: 'Barcelona',
      students: [
        {
          id: '1',
          name: 'Marc',
          surname: 'Garcia Pérez',
          catsalut: 'AAAA1234567890',
          grade: 'I3'
        },
        {
          id: '2',
          name: 'Laura',
          surname: 'Garcia Pérez',
          catsalut: 'BBBB9876543210',
          grade: '2'
        },
        {
          id: '3',
          name: 'Pau',
          surname: 'Garcia Pérez',
          catsalut: 'CCCC5555666677',
          grade: '5'
        }
      ],
      acceptData: true,
      paymentReceipt: formData.paymentReceipt // Keep the existing file if any
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Development Test Button */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: 'var(--radius)' }}>
          <button
            type="button"
            onClick={fillTestData}
            style={{
              background: '#ffc107',
              color: '#000',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🧪 Rellenar datos de prueba (3 alumnos)
          </button>
          <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#856404' }}>
            Solo visible en desarrollo
          </span>
        </div>
      )}

      {/* Validation Error Message */}
      {submitStatus === 'validation-error' && (
        <div className={styles.errorMessage} style={{ marginBottom: '20px' }}>
          ⚠️ {t('validationError')}
        </div>
      )}

      {/* Guardian 1 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('guardian1')}</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="guardian1Name" className={styles.label}>
            {t('fields.name')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="guardian1Name"
            className={`${styles.input} ${errors.guardian1Name ? styles.inputError : ''}`}
            value={formData.guardian1Name}
            onChange={(e) => handleFieldChange('guardian1Name', e.target.value)}
          />
          {errors.guardian1Name && <span className={styles.error}>{errors.guardian1Name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="guardian1Dni" className={styles.label}>
            {t('fields.dni')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="guardian1Dni"
            className={`${styles.input} ${errors.guardian1Dni ? styles.inputError : ''}`}
            value={formData.guardian1Dni}
            onChange={(e) => handleFieldChange('guardian1Dni', e.target.value)}
            placeholder="12345678A"
          />
          {errors.guardian1Dni && <span className={styles.error}>{errors.guardian1Dni}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="guardian1Email" className={styles.label}>
            {t('fields.email')} <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="guardian1Email"
            className={`${styles.input} ${errors.guardian1Email ? styles.inputError : ''}`}
            value={formData.guardian1Email}
            onChange={(e) => handleFieldChange('guardian1Email', e.target.value)}
          />
          {errors.guardian1Email && <span className={styles.error}>{errors.guardian1Email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="guardian1Phone" className={styles.label}>
            {t('fields.phone')} <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="guardian1Phone"
            className={`${styles.input} ${errors.guardian1Phone ? styles.inputError : ''}`}
            value={formData.guardian1Phone}
            onChange={(e) => handleFieldChange('guardian1Phone', e.target.value)}
            placeholder="123456789"
          />
          {errors.guardian1Phone && <span className={styles.error}>{errors.guardian1Phone}</span>}
        </div>
      </section>

      {/* Guardian 2 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('guardian2')}</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="guardian2Name" className={styles.label}>
            {t('fields.name')}
          </label>
          <input
            type="text"
            id="guardian2Name"
            className={styles.input}
            value={formData.guardian2Name}
            onChange={(e) => handleFieldChange('guardian2Name', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="guardian2Dni" className={styles.label}>
            {t('fields.dni')}
          </label>
          <input
            type="text"
            id="guardian2Dni"
            className={`${styles.input} ${errors.guardian2Dni ? styles.inputError : ''}`}
            value={formData.guardian2Dni}
            onChange={(e) => handleFieldChange('guardian2Dni', e.target.value)}
            placeholder="12345678A"
          />
          {errors.guardian2Dni && <span className={styles.error}>{errors.guardian2Dni}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="guardian2Email" className={styles.label}>
            {t('fields.email')}
          </label>
          <input
            type="email"
            id="guardian2Email"
            className={`${styles.input} ${errors.guardian2Email ? styles.inputError : ''}`}
            value={formData.guardian2Email}
            onChange={(e) => handleFieldChange('guardian2Email', e.target.value)}
          />
          {errors.guardian2Email && <span className={styles.error}>{errors.guardian2Email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="guardian2Phone" className={styles.label}>
            {t('fields.phone')}
          </label>
          <input
            type="tel"
            id="guardian2Phone"
            className={`${styles.input} ${errors.guardian2Phone ? styles.inputError : ''}`}
            value={formData.guardian2Phone}
            onChange={(e) => handleFieldChange('guardian2Phone', e.target.value)}
            placeholder="123456789"
          />
          {errors.guardian2Phone && <span className={styles.error}>{errors.guardian2Phone}</span>}
        </div>
      </section>

      {/* Home Address */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('homeAddress')}</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>
            {t('fields.address')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="address"
            className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          {errors.address && <span className={styles.error}>{errors.address}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="number" className={styles.label}>
              {t('fields.number')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="number"
              className={`${styles.input} ${errors.number ? styles.inputError : ''}`}
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
            {errors.number && <span className={styles.error}>{errors.number}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="floor" className={styles.label}>
              {t('fields.floor')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="floor"
              className={`${styles.input} ${errors.floor ? styles.inputError : ''}`}
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            />
            {errors.floor && <span className={styles.error}>{errors.floor}</span>}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="postalCode" className={styles.label}>
              {t('fields.postalCode')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="postalCode"
              className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`}
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            {errors.postalCode && <span className={styles.error}>{errors.postalCode}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="city" className={styles.label}>
              {t('fields.city')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="city"
              className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Hospitalet de Llobregat"
            />
            {errors.city && <span className={styles.error}>{errors.city}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="province" className={styles.label}>
            {t('fields.province')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="province"
            className={`${styles.input} ${errors.province ? styles.inputError : ''}`}
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            placeholder="Barcelona"
          />
          {errors.province && <span className={styles.error}>{errors.province}</span>}
        </div>
      </section>

      {/* Students */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('students')}</h2>
        
        {formData.students.map((student, index) => (
          <div key={student.id} className={styles.studentCard}>
            <div className={styles.studentHeader}>
              <h3 className={styles.studentTitle}>
                {t('students')} {index + 1}
              </h3>
              {formData.students.length > 1 && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeStudent(student.id)}
                >
                  {t('removeStudent')}
                </button>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor={`studentName${index}`} className={styles.label}>
                {t('fields.studentName')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id={`studentName${index}`}
                className={`${styles.input} ${errors[`student${index}Name`] ? styles.inputError : ''}`}
                value={student.name}
                onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
              />
              {errors[`student${index}Name`] && <span className={styles.error}>{errors[`student${index}Name`]}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor={`studentSurname${index}`} className={styles.label}>
                {t('fields.studentSurname')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id={`studentSurname${index}`}
                className={`${styles.input} ${errors[`student${index}Surname`] ? styles.inputError : ''}`}
                value={student.surname}
                onChange={(e) => updateStudent(student.id, 'surname', e.target.value)}
              />
              {errors[`student${index}Surname`] && <span className={styles.error}>{errors[`student${index}Surname`]}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor={`studentCatsalut${index}`} className={styles.label}>
                {t('fields.catsalut')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id={`studentCatsalut${index}`}
                className={`${styles.input} ${errors[`student${index}Catsalut`] ? styles.inputError : ''}`}
                value={student.catsalut}
                onChange={(e) => updateStudent(student.id, 'catsalut', e.target.value)}
                placeholder="AAAA1234567890"
              />
              {errors[`student${index}Catsalut`] && <span className={styles.error}>{errors[`student${index}Catsalut`]}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor={`studentGrade${index}`} className={styles.label}>
                {t('fields.grade')} <span className={styles.required}>*</span>
              </label>
              <select
                id={`studentGrade${index}`}
                className={`${styles.select} ${errors[`student${index}Grade`] ? styles.inputError : ''}`}
                value={student.grade}
                onChange={(e) => updateStudent(student.id, 'grade', e.target.value)}
              >
                <option value="">-- {t('fields.grade')} --</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {t(`grades.${grade}`)}
                  </option>
                ))}
              </select>
              {errors[`student${index}Grade`] && <span className={styles.error}>{errors[`student${index}Grade`]}</span>}
            </div>
          </div>
        ))}

        <button
          type="button"
          className={styles.addButton}
          onClick={addStudent}
        >
          + {t('addStudent')}
        </button>
      </section>

      {/* Payment Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('paymentInfo')}</h2>
        
        <div className={styles.paymentInfoBox}>
          <p className={styles.paymentText}>{t('paymentInfoText')}</p>
          <p className={styles.bankAccount}>{t('bankAccount')}</p>
          <p className={styles.paymentText}>{t('paymentConcept')}</p>
          <p className={styles.conceptFormat}>{t('paymentConceptFormat')}</p>
          {paymentConcept ? (
            <p className={styles.conceptDynamic}>
              <strong>{paymentConcept}</strong>
            </p>
          ) : (
            <p className={styles.conceptExample}>{t('paymentConceptExample')}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="receipt" className={styles.label}>
            {t('uploadReceipt')} <span className={styles.required}>*</span>
          </label>
          <input
            type="file"
            id="receipt"
            accept=".pdf,.jpg,.jpeg,.png"
            className={`${styles.fileInput} ${errors.paymentReceipt ? styles.inputError : ''}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                if (file.size > maxSize) {
                  setErrors(prev => ({ 
                    ...prev, 
                    paymentReceipt: t('fileTooLarge') || 'El archivo es demasiado grande (máx 10MB)' 
                  }));
                  e.target.value = ''; // Clear the input
                  return;
                }
                
                setFormData({ ...formData, paymentReceipt: file });
                // Clear error when file is selected
                if (errors.paymentReceipt) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.paymentReceipt;
                    return newErrors;
                  });
                }
              }
            }}
          />
          {errors.paymentReceipt && <span className={styles.error}>{errors.paymentReceipt}</span>}
          {formData.paymentReceipt && (
            <span className={styles.helpText}>
              📎 {formData.paymentReceipt.name} ({(formData.paymentReceipt.size / 1024).toFixed(0)} KB)
            </span>
          )}
        </div>
      </section>

      {/* Data Protection */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dataProtection')}</h2>
        
        <div className={styles.dataProtectionBox}>
          <p className={styles.dataProtectionText}>
            {t('dataProtectionText')}
          </p>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="acceptData"
            className={styles.checkbox}
            checked={formData.acceptData}
            onChange={(e) => {
              setFormData({ ...formData, acceptData: e.target.checked });
              // Clear validation error when user accepts
              if (e.target.checked && submitStatus === 'validation-error') {
                setSubmitStatus('idle');
              }
            }}
          />
          <label htmlFor="acceptData" className={styles.checkboxLabel}>
            {t('acceptDataProtection')} <span className={styles.required}>*</span>
          </label>
        </div>
        {errors.acceptData && <span className={styles.error}>{errors.acceptData}</span>}
      </section>

      {/* Submit Button */}
      <div className={styles.submitSection}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>

        {submitStatus === 'success' && (
          <p className={styles.successMessage}>{t('success')}</p>
        )}
        {submitStatus === 'error' && (
          <p className={styles.errorMessage}>{t('error')}</p>
        )}
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleSignatureConfirm}
        guardianName={formData.guardian1Name}
        locale={locale}
      />

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>{t('sending')}</p>
        </div>
      )}
    </form>
  );
}
