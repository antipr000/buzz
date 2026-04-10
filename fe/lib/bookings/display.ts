import type { BookingTicketLineOut } from '@/services/types/booking'

export function formatBookingDoneAt(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    })
}

export function formatEventWhen(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const datePart = d.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    const timePart = d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    })
    return `${datePart} | ${timePart}`
}

export function formatTicketLines(tickets: BookingTicketLineOut[]): string {
    return tickets
        .map((line) => {
            const seats = line.seats.map((s) => s.trim()).filter(Boolean)
            const seatPart = seats.length ? ` - ${seats.join(', ')}` : ''
            const n = line.quantity
            const unit = n === 1 ? 'Ticket' : 'Tickets'
            return `${n} ${unit}: ${line.ticket_tier}${seatPart}`
        })
        .join('\n')
}

export function getBookingStatusPresentation(status: string): {
    label: string
    message: string
    badgeColor: string
} {
    const u = status.trim().toUpperCase()
    switch (u) {
        case 'UPCOMING':
            return {
                label: 'UPCOMING',
                message: 'Your e-ticket is ready. See you at the event!',
                badgeColor: 'rgb(59,130,246)',
            }
        case 'ATTENDED':
            return {
                label: 'ATTENDED',
                message: 'Hope you had an amazing time!',
                badgeColor: 'rgb(145,145,145)',
            }
        case 'CANCELLED':
            return {
                label: 'CANCELLED',
                message: 'This booking was cancelled.',
                badgeColor: 'rgb(239,68,68)',
            }
        default:
            return {
                label: u || status,
                message: '',
                badgeColor: 'rgb(145,145,145)',
            }
    }
}
