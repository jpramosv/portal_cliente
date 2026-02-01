/**
 * Clinicorp Integration Service (Mock with Real Data Structure)
 * 
 * Adapted to handle the specific JSON structure provided by the user.
 */

// Sample data extracted from user dump
const MOCK_DB = [
    {
        "id": 5920922672300033,
        "PatientName": "Maria Paula Martins",
        "MobilePhone": "37999584147",
        "date": "2026-02-02T00:00:00.000Z",
        "fromTime": "17:00",
        "toTime": "17:30",
        "CategoryDescription": "Clínico",
        "CategoryColor": "#ff0000",
        "Deleted": "",
        "Dentist_PersonId": 6348578954149888
    },
    {
        "id": 4578041999130625,
        "PatientName": "Hiandara Goulart Rodarte",
        "MobilePhone": "37999254416",
        "date": "2026-02-02T03:00:00.000Z",
        "fromTime": "13:30",
        "toTime": "14:00",
        "CategoryDescription": "Avaliação",
        "CategoryColor": "#aed581",
        "Deleted": "",
        "Notes": "",
        "Dentist_PersonId": 5672613848547328
    },
    {
        "id": 5715127926587392,
        "PatientName": "Rozelia Maria Gomes Santos",
        "MobilePhone": "37999515146",
        "date": "2026-02-03T03:00:00.000Z",
        "fromTime": "15:00",
        "toTime": "16:00",
        "CategoryDescription": "Clínico",
        "CategoryColor": "#ff0000",
        "Deleted": "X", // This means cancelled/deleted
        "Dentist_PersonId": 5672613848547328
    }
]

export class ClinicorpService {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.CLINICORP_API_KEY
        this.baseUrl = config.baseUrl || 'https://api.clinicorp.com/v1'
    }

    /**
     * Parses Clinicorp specific date + time format into standard ISO
     */
    parseDateTime(dateStr, timeStr) {
        if (!dateStr || !timeStr) return null
        try {
            // dateStr is usually T00:00:00 or T03:00:00 (due to timezone offset probably)
            // We strip time and combine with timeStr
            const datePart = dateStr.split('T')[0]
            const [hours, mins] = timeStr.split(':')

            // Construct local date object (assuming Brazil/Clinic Timezone)
            // Ideally we'd use a library like date-fns-tz or luxon for robustness
            const d = new Date(`${datePart}T${hours}:${mins}:00`)
            return d.toISOString()
        } catch (e) {
            console.error('Date parsing error', e)
            return null
        }
    }

    /**
     * Normalizes Clinicorp raw object to our Schema
     */
    normalize(item) {
        const startTime = this.parseDateTime(item.date, item.fromTime)
        const endTime = this.parseDateTime(item.date, item.toTime)

        let status = 'scheduled'
        if (item.Deleted === 'X') status = 'cancelled'

        return {
            id: item.id.toString(), // Internal mock ID
            external_id: item.id.toString(), // External Reference ID
            patient_name: item.PatientName,
            patient_phone: item.MobilePhone,
            start_time: startTime,
            end_time: endTime,
            status: status,
            procedure: item.CategoryDescription,
            procedure_color: item.CategoryColor,
            dentist_id: item.Dentist_PersonId?.toString(),
            notes: item.Notes || '',
            raw: item // Keep raw data for debug
        }
    }

    /**
     * Fetch appointments (Mock filtering by date string match)
     */
    async getAppointments(date) {
        console.log(`[Clinicorp Mock] Fetching appointments for date: ${date}`)
        await new Promise(resolve => setTimeout(resolve, 600))

        // Filter mock DB by simple date text inclusion (naive mock logic)
        // In real API, we would pass ?start=X&end=Y
        const targetDate = date.split('T')[0]

        const results = MOCK_DB
            .filter(item => item.date.startsWith(targetDate))
            .map(item => this.normalize(item))

        return results
    }

    /**
     * Create appointment
     */
    async createAppointment(data) {
        console.log(`[Clinicorp Mock] Creating appointment:`, data)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Extract time from ISO strings
        const dateObj = new Date(data.start_time)
        const dateStr = dateObj.toISOString().split('T')[0] + "T00:00:00.000Z"
        const fromTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

        // Mock ID
        const newId = Date.now()

        const newItem = {
            id: newId,
            PatientName: data.patient_name || 'Novo Paciente', // We depend on caller to provide name or logic to look it up
            CategoryDescription: data.title || 'Consulta',
            date: dateStr,
            fromTime: fromTime, // Naive
            toTime: "00:00", // Naive
            Deleted: ""
        }

        MOCK_DB.push(newItem)

        return this.normalize(newItem)
    }
}

export const clinicorp = new ClinicorpService()
