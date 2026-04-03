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
    badgeClassName: string
} {
    const u = status.trim().toUpperCase()
    switch (u) {
        case 'UPCOMING':
            return {
                label: 'UPCOMING',
                message: 'Your e-ticket is ready. See you at the event!',
                badgeClassName: 'bg-[rgba(59,130,246,1)]',
            }
        case 'ATTENDED':
            return {
                label: 'ATTENDED',
                message: 'Hope you had an amazing time!',
                badgeClassName: 'bg-[rgba(145,145,145,1)]',
            }
        case 'CANCELLED':
            return {
                label: 'CANCELLED',
                message: 'This booking was cancelled.',
                badgeClassName: 'bg-[rgba(239,68,68,1)]',
            }
        default:
            return {
                label: u || status,
                message: '',
                badgeClassName: 'bg-[rgba(145,145,145,1)]',
            }
    }
}
