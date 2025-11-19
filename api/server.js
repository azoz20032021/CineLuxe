
import 'dotenv/config'; 
import express from 'express';
import { Resend } from 'resend';
import cors from 'cors'; 
import fs from 'fs'; 

const TEMP_DB_FILE = 'temp_codes.json';
const PORT = 3001;
const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();

app.use(cors({
    origin: 'http://localhost:3001'
}));
app.use(express.json());

function getCodeDB() {
    try {
        if (fs.existsSync(TEMP_DB_FILE)) {
                return JSON.parse(fs.readFileSync(TEMP_DB_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Error reading temp DB:", e);
    }
    return {};
}

function saveCodeDB(db) {
    try {
        fs.writeFileSync(TEMP_DB_FILE, JSON.stringify(db), 'utf8');
    } catch (e) {
        console.error("Error writing temp DB:", e);
    }
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-code', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).send({ error: 'الرجاء إدخال البريد الإلكتروني.' });
    }

    const verificationCode = generateCode();
        const db = getCodeDB();
    const expirationTime = Date.now() + 5 * 60 * 1000; 
    db[email] = { code: verificationCode, expires: expirationTime };
    saveCodeDB(db); 

    try {
        const { error } = await resend.emails.send({
            from: 'onboarding@cineluxea.shop',
            to: [email],
            subject: 'كود التحقق لحساب Cine Luxe',
            html: `<h1>كود التفعيل الخاص بك هو: <strong>${verificationCode}</strong></h1>`,
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(500).send({ error: 'فشل إرسال البريد الإلكتروني. يرجى مراجعة إعدادات Resend.' });
        }

        res.status(200).send({ message: 'تم إرسال كود التحقق بنجاح.' });

    } catch (e) {
        console.error('Server Error:', e);
        res.status(500).send({ error: 'حدث خطأ في الخادم.' });
    }
});

app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).send({ error: 'الرجاء توفير البريد الإلكتروني ورمز التحقق.' });
    }

    const db = getCodeDB();
    const codeData = db[email];

    if (!codeData) {
        return res.status(400).send({ error: 'لم يتم إرسال رمز تحقق لهذا البريد الإلكتروني.' });
    }

    if (Date.now() > codeData.expires) {
        delete db[email]; 
        saveCodeDB(db);
        return res.status(400).send({ error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.' });
    }

    if (code === codeData.code) {
        delete db[email]; 
        saveCodeDB(db);
        return res.status(200).send({ success: true, message: 'تم التحقق بنجاح!' });
    } else {
        return res.status(400).send({ error: 'رمز التحقق غير صحيح.' });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Backend Server running on http://localhost:${PORT}`);
});