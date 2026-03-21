/**
 * Tests para el parser de emails de Booking.com
 * Cubre: nueva reserva, cancelación, modificación, emails inválidos y edge cases
 */

import { describe, it, expect } from 'vitest'
import { parseBookingEmail } from '../src/lib/reservations/parsers/booking-parser'

// ---------------------------------------------------------------------------
// Emails de nueva reserva en español
// ---------------------------------------------------------------------------

const NEW_RESERVATION_ES_SUBJECT = 'Nueva reserva: Apartamento Sol y Mar — Booking.com'

const NEW_RESERVATION_ES_TEXT = `
Booking.com
Nueva reserva confirmada

Número de reserva: 3847561209
Alojamiento: Apartamento Sol y Mar

Nombre del huésped: María García López
País: España

Llegada: martes, 15 de abril de 2025 – 15:00
Salida: viernes, 18 de abril de 2025 – 11:00

Duración: 3 noches
Número de huéspedes: 2 adultos

Peticiones especiales: Cuna de bebé si es posible

Precio de la estancia: 270,00 €
Comisión de Booking.com: 40,50 €
Importe que recibirás: 229,50 €

Total: 270,00 €

Gracias por usar Booking.com
`

const NEW_RESERVATION_ES_HTML = `
<html><body>
<p><strong>Booking.com</strong></p>
<p>Nueva reserva confirmada</p>
<p>Número de reserva: 3847561209</p>
<p>Alojamiento: Apartamento Sol y Mar</p>
<p>Nombre del huésped: María García López</p>
<p>País: España</p>
<p>Llegada: martes, 15 de abril de 2025 – 15:00</p>
<p>Salida: viernes, 18 de abril de 2025 – 11:00</p>
<p>Duración: 3 noches</p>
<p>Número de huéspedes: 2 adultos</p>
<p>Peticiones especiales: Cuna de bebé si es posible</p>
<p>Precio de la estancia: 270,00 €</p>
<p>Comisión de Booking.com: 40,50 €</p>
<p>Importe que recibirás: 229,50 €</p>
<p>Total: 270,00 €</p>
</body></html>
`

// ---------------------------------------------------------------------------
// Email de nueva reserva en inglés
// ---------------------------------------------------------------------------

const NEW_RESERVATION_EN_SUBJECT = 'New reservation: Coastal Apartment Barcelona — Booking.com'

const NEW_RESERVATION_EN_TEXT = `
Booking.com — New Reservation

Booking number: 5012349876
Accommodation: Coastal Apartment Barcelona

Guest name: James O'Brien
Country: United Kingdom

Check-in: Monday, 10 June 2025
Check-out: Thursday, 13 June 2025

Duration: 3 nights
Number of guests: 2 adults, 1 child

Room rate: 300.00 EUR
Booking commission: 45.00 EUR
You will receive: 255.00 EUR

Total price: 300.00 EUR

Thank you for using Booking.com
`

// ---------------------------------------------------------------------------
// Email de cancelación en español
// ---------------------------------------------------------------------------

const CANCELLATION_ES_SUBJECT = 'Reserva cancelada — Booking.com'

const CANCELLATION_ES_TEXT = `
Booking.com

Tu reserva ha sido cancelada.

Número de reserva: 9912345678
Alojamiento: Villa Las Palmeras

Nombre del huésped: Carlos Ruiz Martínez
País: México

Llegada: 5 de mayo de 2025
Salida: 10 de mayo de 2025

Duración: 5 noches
2 adultos

Total: 650,00 €
Importe que recibirás: 0,00 €

Esta reserva ha sido cancelada según la política de cancelación.
`

// ---------------------------------------------------------------------------
// Email de cancelación en inglés (detectado por subject)
// ---------------------------------------------------------------------------

const CANCELLATION_EN_SUBJECT = 'Your booking has been cancelled — Booking.com'

const CANCELLATION_EN_TEXT = `
Booking.com

Your reservation has been cancelled.

Booking number: 7723456789
Accommodation: Sunny Studio Madrid

Guest name: Emma Thompson
Country: Australia

Check-in: 20 June 2025
Check-out: 25 June 2025

5 nights
2 adults

Total: 450.00 EUR
`

// ---------------------------------------------------------------------------
// Email de modificación en español
// ---------------------------------------------------------------------------

const MODIFICATION_ES_SUBJECT = 'Reserva modificada — Booking.com'

const MODIFICATION_ES_TEXT = `
Booking.com

Tu reserva ha sido modificada.

Número de reserva: 4456789012
Alojamiento: Piso Centro Histórico

Nombre del huésped: Ana Martínez
País: España

Llegada: 1 de julio de 2025
Salida: 5 de julio de 2025

Duración: 4 noches
2 adultos

Precio de la estancia: 320,00 €
Comisión de Booking.com: 48,00 €
Importe que recibirás: 272,00 €

Total: 320,00 €
`

// ---------------------------------------------------------------------------
// Email de modificación en inglés (detectado por texto)
// ---------------------------------------------------------------------------

const MODIFICATION_EN_SUBJECT = 'Booking update — Booking.com'

const MODIFICATION_EN_TEXT = `
Booking.com

Your reservation has been modified.

Booking number: 6634567890
Accommodation: Beachfront Apartment

Guest name: Sophie Müller
Country: Germany

Check-in: 2025-08-01
Check-out: 2025-08-07

6 nights
3 adults

Total price: 720.00 EUR
Payout: 612.00 EUR
`

// ---------------------------------------------------------------------------
// Emails inválidos / no reconocibles
// ---------------------------------------------------------------------------

const UNRELATED_SUBJECT = 'Your Booking.com newsletter — promotions this week'
const UNRELATED_TEXT = `
Booking.com Weekly Newsletter

Discover great deals this week!
No reservation information here.
Just promotional content.
`

const MISSING_DATES_SUBJECT = 'Nueva reserva — Booking.com'
const MISSING_DATES_TEXT = `
Booking.com

Número de reserva: 1234567890
Nombre del huésped: Pedro Sánchez

Sin fechas de llegada ni salida.
Total: 100,00 €
`

const MISSING_CODE_SUBJECT = 'Nueva reserva — Booking.com'
const MISSING_CODE_TEXT = `
Booking.com

Sin número de reserva aquí.

Nombre del huésped: Laura López

Llegada: 10 de agosto de 2025
Salida: 15 de agosto de 2025

5 noches
Total: 500,00 €
`

// ---------------------------------------------------------------------------
// Email con formato de rango de fechas "del X al Y"
// ---------------------------------------------------------------------------

const RANGE_DATES_SUBJECT = 'Nueva reserva — Booking.com'
const RANGE_DATES_TEXT = `
Booking.com

Número de reserva: 2233445566
Alojamiento: Casa Rural El Molino

Nombre del huésped: Roberto Fernández
País: España

Estancia del 20 de agosto al 25 de agosto de 2025.

Duración: 5 noches
2 adultos

Total: 600,00 €
Importe que recibirás: 510,00 €
`

// ---------------------------------------------------------------------------
// Email con fechas ISO
// ---------------------------------------------------------------------------

const ISO_DATES_SUBJECT = 'New reservation — Booking.com'
const ISO_DATES_TEXT = `
Booking.com

Booking number: 9988776655

Guest name: Thomas Klein
Country: Germany

Check-in: 2025-09-01
Check-out: 2025-09-05

4 nights
1 adult

Total price: 400.00 EUR
Payout: 340.00 EUR
`

// ---------------------------------------------------------------------------
// Email con fechas DD/MM/YYYY
// ---------------------------------------------------------------------------

const DMY_DATES_SUBJECT = 'Nueva reserva — Booking.com'
const DMY_DATES_TEXT = `
Booking.com

Número de reserva: 1122334455

Nombre del huésped: Isabel Torres

Check-in: 15/10/2025
Check-out: 20/10/2025

Duración: 5 noches
2 adultos

Total: 550,00 €
Importe que recibirás: 467,50 €
`

// ===========================================================================
// TESTS
// ===========================================================================

describe('parseBookingEmail — Nueva reserva (español)', () => {
  const result = parseBookingEmail(
    NEW_RESERVATION_ES_SUBJECT,
    NEW_RESERVATION_ES_HTML,
    NEW_RESERVATION_ES_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('platform es BOOKING', () => {
    expect(result!.platform).toBe('BOOKING')
  })

  it('eventType es NEW_RESERVATION', () => {
    expect(result!.eventType).toBe('NEW_RESERVATION')
  })

  it('extrae el código de confirmación correctamente', () => {
    expect(result!.confirmationCode).toBe('3847561209')
  })

  it('extrae el nombre del huésped', () => {
    expect(result!.guestName).toBe('María García López')
  })

  it('extrae el nombre de la propiedad', () => {
    expect(result!.propertyName).toContain('Apartamento Sol y Mar')
  })

  it('extrae el país del huésped', () => {
    expect(result!.guestCountry).toBe('España')
  })

  it('extrae la fecha de check-in correctamente', () => {
    const checkIn = result!.checkIn
    expect(checkIn).toBeInstanceOf(Date)
    expect(checkIn.getFullYear()).toBe(2025)
    expect(checkIn.getMonth()).toBe(3) // abril = mes 3 (0-based)
    expect(checkIn.getDate()).toBe(15)
  })

  it('extrae la fecha de check-out correctamente', () => {
    const checkOut = result!.checkOut
    expect(checkOut).toBeInstanceOf(Date)
    expect(checkOut.getFullYear()).toBe(2025)
    expect(checkOut.getMonth()).toBe(3) // abril
    expect(checkOut.getDate()).toBe(18)
  })

  it('calcula las noches correctamente', () => {
    expect(result!.nights).toBe(3)
  })

  it('extrae el número de adultos', () => {
    expect(result!.travelers?.adults).toBe(2)
  })

  it('extrae los ingresos del anfitrión (hostEarnings)', () => {
    expect(result!.hostEarnings).toBe(229.50)
  })

  it('extrae el total pagado', () => {
    expect(result!.totalPaid).toBe(270)
  })

  it('extrae la comisión de Booking', () => {
    expect(result!.hostServiceFee).toBe(40.50)
  })

  it('la moneda es EUR por defecto', () => {
    expect(result!.currency).toBe('EUR')
  })

  it('extrae la petición especial como mensaje', () => {
    expect(result!.guestMessage).toContain('Cuna de bebé')
  })

  it('guestVerified es false (Booking no lo indica)', () => {
    expect(result!.guestVerified).toBe(false)
  })

  it('rawEmail contiene los primeros 5000 caracteres del texto', () => {
    expect(typeof result!.rawEmail).toBe('string')
    expect(result!.rawEmail!.length).toBeGreaterThan(0)
    expect(result!.rawEmail!.length).toBeLessThanOrEqual(5000)
  })
})

describe('parseBookingEmail — Nueva reserva (inglés)', () => {
  const result = parseBookingEmail(
    NEW_RESERVATION_EN_SUBJECT,
    '',
    NEW_RESERVATION_EN_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('platform es BOOKING', () => {
    expect(result!.platform).toBe('BOOKING')
  })

  it('eventType es NEW_RESERVATION', () => {
    expect(result!.eventType).toBe('NEW_RESERVATION')
  })

  it('extrae el booking number en inglés', () => {
    expect(result!.confirmationCode).toBe('5012349876')
  })

  it('extrae guest name en inglés', () => {
    expect(result!.guestName).toContain("James O'Brien")
  })

  it('extrae el país del huésped en inglés', () => {
    expect(result!.guestCountry).toBe('United Kingdom')
  })

  it('extrae check-in en inglés', () => {
    const checkIn = result!.checkIn
    expect(checkIn.getFullYear()).toBe(2025)
    expect(checkIn.getMonth()).toBe(5) // junio = 5
    expect(checkIn.getDate()).toBe(10)
  })

  it('extrae check-out en inglés', () => {
    const checkOut = result!.checkOut
    expect(checkOut.getFullYear()).toBe(2025)
    expect(checkOut.getMonth()).toBe(5) // junio = 5
    expect(checkOut.getDate()).toBe(13)
  })

  it('extrae adultos y niños', () => {
    expect(result!.travelers?.adults).toBe(2)
    expect(result!.travelers?.children).toBe(1)
  })

  it('extrae payout (you will receive)', () => {
    expect(result!.hostEarnings).toBe(255)
  })

  it('la moneda es EUR', () => {
    expect(result!.currency).toBe('EUR')
  })
})

describe('parseBookingEmail — Cancelación (español, detectado por subject)', () => {
  const result = parseBookingEmail(
    CANCELLATION_ES_SUBJECT,
    '',
    CANCELLATION_ES_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('eventType es CANCELLATION', () => {
    expect(result!.eventType).toBe('CANCELLATION')
  })

  it('platform es BOOKING', () => {
    expect(result!.platform).toBe('BOOKING')
  })

  it('extrae el código de confirmación', () => {
    expect(result!.confirmationCode).toBe('9912345678')
  })

  it('extrae el nombre del huésped', () => {
    expect(result!.guestName).toBe('Carlos Ruiz Martínez')
  })

  it('extrae las fechas de la reserva cancelada', () => {
    expect(result!.checkIn).toBeInstanceOf(Date)
    expect(result!.checkOut).toBeInstanceOf(Date)
    expect(result!.checkIn.getMonth()).toBe(4) // mayo = 4
    expect(result!.checkOut.getDate()).toBe(10)
  })

  it('extrae las noches', () => {
    expect(result!.nights).toBe(5)
  })
})

describe('parseBookingEmail — Cancelación (inglés, detectado por subject)', () => {
  const result = parseBookingEmail(
    CANCELLATION_EN_SUBJECT,
    '',
    CANCELLATION_EN_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('eventType es CANCELLATION', () => {
    expect(result!.eventType).toBe('CANCELLATION')
  })

  it('extrae el código de confirmación', () => {
    expect(result!.confirmationCode).toBe('7723456789')
  })
})

describe('parseBookingEmail — Cancelación detectada en el cuerpo del texto', () => {
  const result = parseBookingEmail(
    'Notificación — Booking.com',
    '',
    CANCELLATION_ES_TEXT // contiene "ha sido cancelada"
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('eventType es CANCELLATION por texto del cuerpo', () => {
    expect(result!.eventType).toBe('CANCELLATION')
  })
})

describe('parseBookingEmail — Modificación (español)', () => {
  const result = parseBookingEmail(
    MODIFICATION_ES_SUBJECT,
    '',
    MODIFICATION_ES_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('eventType es MODIFICATION', () => {
    expect(result!.eventType).toBe('MODIFICATION')
  })

  it('platform es BOOKING', () => {
    expect(result!.platform).toBe('BOOKING')
  })

  it('extrae el código de confirmación', () => {
    expect(result!.confirmationCode).toBe('4456789012')
  })

  it('extrae el nombre del huésped', () => {
    expect(result!.guestName).toBe('Ana Martínez')
  })

  it('extrae las fechas de la reserva modificada', () => {
    expect(result!.checkIn.getMonth()).toBe(6) // julio = 6
    expect(result!.checkIn.getDate()).toBe(1)
    expect(result!.checkOut.getDate()).toBe(5)
    expect(result!.nights).toBe(4)
  })

  it('extrae los importes correctamente', () => {
    expect(result!.hostEarnings).toBe(272)
    expect(result!.hostServiceFee).toBe(48)
    expect(result!.totalPaid).toBe(320)
  })
})

describe('parseBookingEmail — Modificación (inglés, detectado en cuerpo)', () => {
  const result = parseBookingEmail(
    MODIFICATION_EN_SUBJECT,
    '',
    MODIFICATION_EN_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('eventType es MODIFICATION por texto del cuerpo', () => {
    expect(result!.eventType).toBe('MODIFICATION')
  })

  it('extrae el código de confirmación', () => {
    expect(result!.confirmationCode).toBe('6634567890')
  })

  it('extrae payout correctamente', () => {
    expect(result!.hostEarnings).toBe(612)
  })

  it('extrae la moneda EUR desde texto', () => {
    expect(result!.currency).toBe('EUR')
  })
})

describe('parseBookingEmail — Email no reconocible devuelve null', () => {
  it('newsletter sin código de reserva devuelve null', () => {
    const result = parseBookingEmail(
      UNRELATED_SUBJECT,
      '',
      UNRELATED_TEXT
    )
    expect(result).toBeNull()
  })

  it('texto vacío devuelve null', () => {
    const result = parseBookingEmail('', '', '')
    expect(result).toBeNull()
  })

  it('solo espacios en blanco devuelve null', () => {
    const result = parseBookingEmail('   ', '   ', '   ')
    expect(result).toBeNull()
  })
})

describe('parseBookingEmail — Edge case: fechas faltantes', () => {
  it('devuelve null si no hay fechas detectables', () => {
    const result = parseBookingEmail(
      MISSING_DATES_SUBJECT,
      '',
      MISSING_DATES_TEXT
    )
    expect(result).toBeNull()
  })
})

describe('parseBookingEmail — Edge case: código de confirmación faltante', () => {
  it('devuelve null si no hay código de reserva', () => {
    const result = parseBookingEmail(
      MISSING_CODE_SUBJECT,
      '',
      MISSING_CODE_TEXT
    )
    expect(result).toBeNull()
  })
})

describe('parseBookingEmail — Fechas en formato rango "del X al Y"', () => {
  const result = parseBookingEmail(
    RANGE_DATES_SUBJECT,
    '',
    RANGE_DATES_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('extrae check-in del rango', () => {
    expect(result!.checkIn.getDate()).toBe(20)
    expect(result!.checkIn.getMonth()).toBe(7) // agosto = 7
    expect(result!.checkIn.getFullYear()).toBe(2025)
  })

  it('extrae check-out del rango', () => {
    expect(result!.checkOut.getDate()).toBe(25)
    expect(result!.checkOut.getMonth()).toBe(7) // agosto = 7
    expect(result!.checkOut.getFullYear()).toBe(2025)
  })

  it('extrae las noches', () => {
    expect(result!.nights).toBe(5)
  })

  it('extrae los ingresos del anfitrión', () => {
    expect(result!.hostEarnings).toBe(510)
  })
})

describe('parseBookingEmail — Fechas en formato ISO (YYYY-MM-DD)', () => {
  const result = parseBookingEmail(
    ISO_DATES_SUBJECT,
    '',
    ISO_DATES_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('extrae check-in en formato ISO', () => {
    expect(result!.checkIn.getFullYear()).toBe(2025)
    expect(result!.checkIn.getMonth()).toBe(8) // septiembre = 8
    expect(result!.checkIn.getDate()).toBe(1)
  })

  it('extrae check-out en formato ISO', () => {
    expect(result!.checkOut.getFullYear()).toBe(2025)
    expect(result!.checkOut.getMonth()).toBe(8) // septiembre = 8
    expect(result!.checkOut.getDate()).toBe(5)
  })

  it('calcula 4 noches correctamente', () => {
    expect(result!.nights).toBe(4)
  })

  it('extrae payout', () => {
    expect(result!.hostEarnings).toBe(340)
  })
})

describe('parseBookingEmail — Fechas en formato DD/MM/YYYY', () => {
  const result = parseBookingEmail(
    DMY_DATES_SUBJECT,
    '',
    DMY_DATES_TEXT
  )

  it('no devuelve null', () => {
    expect(result).not.toBeNull()
  })

  it('extrae check-in en formato DD/MM/YYYY', () => {
    expect(result!.checkIn.getDate()).toBe(15)
    expect(result!.checkIn.getMonth()).toBe(9) // octubre = 9
    expect(result!.checkIn.getFullYear()).toBe(2025)
  })

  it('extrae check-out en formato DD/MM/YYYY', () => {
    expect(result!.checkOut.getDate()).toBe(20)
    expect(result!.checkOut.getMonth()).toBe(9) // octubre = 9
  })

  it('calcula 5 noches', () => {
    expect(result!.nights).toBe(5)
  })
})

describe('parseBookingEmail — Uso de htmlBody cuando textBody está vacío', () => {
  const result = parseBookingEmail(
    NEW_RESERVATION_ES_SUBJECT,
    NEW_RESERVATION_ES_HTML,
    '' // sin textBody
  )

  it('no devuelve null usando solo HTML', () => {
    expect(result).not.toBeNull()
  })

  it('extrae el código de confirmación del HTML', () => {
    expect(result!.confirmationCode).toBe('3847561209')
  })

  it('platform es BOOKING', () => {
    expect(result!.platform).toBe('BOOKING')
  })
})

describe('parseBookingEmail — Estructura del resultado', () => {
  const result = parseBookingEmail(
    NEW_RESERVATION_ES_SUBJECT,
    '',
    NEW_RESERVATION_ES_TEXT
  )

  it('el resultado tiene todos los campos requeridos de ParsedReservation', () => {
    expect(result).toMatchObject({
      platform: expect.any(String),
      confirmationCode: expect.any(String),
      propertyName: expect.any(String),
      guestName: expect.any(String),
      guestVerified: expect.any(Boolean),
      checkIn: expect.any(Date),
      checkOut: expect.any(Date),
      nights: expect.any(Number),
      roomTotal: expect.any(Number),
      cleaningFee: expect.any(Number),
      hostServiceFee: expect.any(Number),
      totalPaid: expect.any(Number),
      hostEarnings: expect.any(Number),
      currency: expect.any(String),
      eventType: expect.any(String),
    })
  })

  it('cleaningFee es 0 (Booking no lo separa por defecto)', () => {
    expect(result!.cleaningFee).toBe(0)
  })

  it('guestServiceFee es undefined (Booking no lo reporta al anfitrión)', () => {
    expect(result!.guestServiceFee).toBeUndefined()
  })

  it('cancellationPolicy es undefined', () => {
    expect(result!.cancellationPolicy).toBeUndefined()
  })
})

describe('parseBookingEmail — Manejo de errores internos', () => {
  it('no lanza excepción con inputs nulos-like', () => {
    expect(() => parseBookingEmail('', '', '')).not.toThrow()
  })

  it('no lanza excepción con HTML malformado', () => {
    expect(() =>
      parseBookingEmail(
        'Nueva reserva — Booking.com',
        '<div><p>Número de reserva: 1234567890<br>Sin cierre de tags',
        ''
      )
    ).not.toThrow()
  })

  it('no lanza excepción con caracteres especiales en el texto', () => {
    const weirdText = '☀️ Número de reserva: 9876543210 ✓ Llegada: 1 de enero de 2025 Salida: 5 de enero de 2025'
    expect(() =>
      parseBookingEmail('Nueva reserva — Booking.com', '', weirdText)
    ).not.toThrow()
  })
})
