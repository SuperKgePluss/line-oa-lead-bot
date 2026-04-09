const { google } = require('googleapis');

class SheetService {
    constructor() {
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
        this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Data1';

        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY
                    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
                    : undefined,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({
            version: 'v4',
            auth: this.auth,
        });
    }

    formatDisplayDateTime(dateValue) {
        if (!dateValue) return '';

        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return '';

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    formatThaiDateTime(dateValue) {
        const date = dateValue ? new Date(dateValue) : new Date();

        return date.toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    validateConfig() {
        const requiredEnv = [
            'GOOGLE_SHEET_ID',
            'GOOGLE_SERVICE_ACCOUNT_EMAIL',
            'GOOGLE_PRIVATE_KEY',
        ];

        const missing = requiredEnv.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(`Missing Google Sheets config: ${missing.join(', ')}`);
        }
    }

    formatDateTime(dateValue) {
        const date = dateValue ? new Date(dateValue) : new Date();

        return date.toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    formatTags(tags) {
        if (!Array.isArray(tags) || tags.length === 0) {
            return '';
        }

        return tags.join(', ');
    }

    mapLeadToRow(lead) {
        return [
            this.formatThaiDateTime(lead.completedAt),                  // Date (แสดงไทย)
            lead.name || '',
            lead.product || '',
            lead.quantity || '',
            lead.userId || '',
            lead.triggerKeyword || '',
            this.formatTags(lead.tags),
            lead.followUpStatus || 'pending',
            this.formatDisplayDateTime(lead.lastInteractionAt || lead.completedAt), // อ่านง่าย
            this.formatDisplayDateTime(lead.followUpSentAt),           // อ่านง่าย
        ];
    }

    async appendLead(lead) {
        this.validateConfig();

        if (!lead) {
            throw new Error('appendLead: lead is required');
        }

        const row = this.mapLeadToRow(lead);

        const response = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!A:J`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [row],
            },
        });

        return response.data;
    }

    async getAllLeads() {
        this.validateConfig();

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!A:J`,
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) return [];

        const dataRows = rows.slice(1);

        return dataRows.map((row, index) => ({
            rowIndex: index + 2,
            date: row[0] || '',
            name: row[1] || '',
            product: row[2] || '',
            quantity: row[3] || '',
            userId: row[4] || '',
            keyword: row[5] || '',
            tags: row[6] || '',
            followUpStatus: row[7] || '',
            lastInteractionAt: row[8] || '',
            followUpSentAt: row[9] || '',
        }));
    }

    async updateFollowUpSent(rowIndex, status, followUpSentAt) {
        this.validateConfig();

        await this.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: [
                    {
                        range: `${this.sheetName}!H${rowIndex}`,
                        values: [[status]],
                    },
                    {
                        range: `${this.sheetName}!J${rowIndex}`,
                        values: [[this.formatDisplayDateTime(followUpSentAt)]],
                    },
                ],
            },
        });
    }

    async updateLastInteractionByUserId(userId, timestamp) {
        this.validateConfig();

        const leads = await this.getAllLeads();
        const matchedLeads = leads.filter((lead) => lead.userId === userId);

        if (matchedLeads.length === 0) {
            return false;
        }

        const latestLead = matchedLeads[matchedLeads.length - 1];

        await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!I${latestLead.rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[this.formatDisplayDateTime(timestamp)]],
            },
        });

        return true;
    }
}

module.exports = new SheetService();