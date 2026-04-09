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
            this.formatThaiDateTime(lead.completedAt), // A Date
            lead.name || '',                           // B Name
            lead.product || '',                        // C Product
            lead.quantity || '',                       // D Quantity
            lead.userId || '',                         // E UserID
            lead.triggerKeyword || '',                 // F Keyword
            this.formatTags(lead.tags),                // G Tags
            lead.followUpStatus || 'pending',          // H FollowUpStatus
            this.formatDisplayDateTime(lead.lastInteractionAt || lead.completedAt), // I
            this.formatDisplayDateTime(lead.followUpSentAt),                        // J
            String(lead.followUpStage ?? 0),           // K FollowUpStage
            this.formatDisplayDateTime(lead.nextFollowUpAt), // L NextFollowUpAt
            this.formatDisplayDateTime(lead.followUpSent1At), // M
            this.formatDisplayDateTime(lead.followUpSent2At), // N
            this.formatDisplayDateTime(lead.followUpSent3At), // O
            this.formatDisplayDateTime(lead.followUpSent4At), // P
        ];
    }

    addDays(dateValue, days) {
        const date = new Date(dateValue);
        date.setDate(date.getDate() + days);
        return date;
    }

    async appendLead(lead) {
        this.validateConfig();

        if (!lead) {
            throw new Error('appendLead: lead is required');
        }

        const row = this.mapLeadToRow(lead);

        const response = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!A:P`,
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
            range: `${this.sheetName}!A:P`,
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
            followUpStage: Number(row[10] || 0),
            nextFollowUpAt: row[11] || '',
            followUpSent1At: row[12] || '',
            followUpSent2At: row[13] || '',
            followUpSent3At: row[14] || '',
            followUpSent4At: row[15] || '',
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

    async resetFollowUpByUserId(userId, timestamp) {
        this.validateConfig();

        const leads = await this.getAllLeads();
        const matchedLeads = leads.filter((lead) => lead.userId === userId);

        if (matchedLeads.length === 0) {
            return false;
        }

        const latestLead = matchedLeads[matchedLeads.length - 1];
        const nextFollowUpAt = this.addDays(timestamp, 30);

        await this.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: [
                    {
                        range: `${this.sheetName}!H${latestLead.rowIndex}`,
                        values: [['pending']],
                    },
                    {
                        range: `${this.sheetName}!I${latestLead.rowIndex}`,
                        values: [[this.formatDisplayDateTime(timestamp)]],
                    },
                    {
                        range: `${this.sheetName}!K${latestLead.rowIndex}`,
                        values: [[0]],
                    },
                    {
                        range: `${this.sheetName}!L${latestLead.rowIndex}`,
                        values: [[this.formatDisplayDateTime(nextFollowUpAt)]],
                    },
                ],
            },
        });

        return true;
    }

    async updateFollowUpProgress(rowIndex, payload) {
        this.validateConfig();

        const data = [];

        if (payload.followUpStatus !== undefined) {
            data.push({
                range: `${this.sheetName}!H${rowIndex}`,
                values: [[payload.followUpStatus]],
            });
        }

        if (payload.followUpSentAt !== undefined) {
            data.push({
                range: `${this.sheetName}!J${rowIndex}`,
                values: [[this.formatDisplayDateTime(payload.followUpSentAt)]],
            });
        }

        if (payload.followUpStage !== undefined) {
            data.push({
                range: `${this.sheetName}!K${rowIndex}`,
                values: [[payload.followUpStage]],
            });
        }

        if (payload.nextFollowUpAt !== undefined) {
            data.push({
                range: `${this.sheetName}!L${rowIndex}`,
                values: [[this.formatDisplayDateTime(payload.nextFollowUpAt)]],
            });
        }

        if (payload.followUpSent1At !== undefined) {
            data.push({
                range: `${this.sheetName}!M${rowIndex}`,
                values: [[this.formatDisplayDateTime(payload.followUpSent1At)]],
            });
        }

        if (payload.followUpSent2At !== undefined) {
            data.push({
                range: `${this.sheetName}!N${rowIndex}`,
                values: [[this.formatDisplayDateTime(payload.followUpSent2At)]],
            });
        }

        if (payload.followUpSent3At !== undefined) {
            data.push({
                range: `${this.sheetName}!O${rowIndex}`,
                values: [[this.formatDisplayDateTime(payload.followUpSent3At)]],
            });
        }

        if (payload.followUpSent4At !== undefined) {
            data.push({
                range: `${this.sheetName}!P${rowIndex}`,
                values: [[this.formatDisplayDateTime(payload.followUpSent4At)]],
            });
        }

        if (data.length === 0) return;

        await this.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data,
            },
        });
    }
}

module.exports = new SheetService();