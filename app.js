require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
// const multer = require("multer");
const cors = require("cors");
const winston = require("winston");
const WinstonSyslog = require("winston-syslog").Syslog;
const { exec } = require('child_process');

let queueCnt =1;
let queueCntStr = "";
let saveFilename = "";
let useremail ="";
// const HOST_IP = process.env.HOST_IP;
// get the HOST IP from render.com environment variable
const HOST_IP = process.env.NODE_ENV === 'production' 
    ? process.env.RENDER_EXTERNAL_URL 
    : process.env.HOST_IP;
                

// Configure Winston with Syslog transport
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new WinstonSyslog({
            host: process.env.SYSLOG_HOST || "localhost", // Syslog server host
            port: process.env.SYSLOG_PORT || 514, // Syslog server port
            protocol: process.env.SYSLOG_PROTOCOL || "udp4", // Protocol (udp4, tcp4, etc.)
            app_name: "email-service", // Application name
            facility: "user", // Syslog facility
            localhost: "localhost", // Hostname to log
        }),
        new winston.transports.Console(), // Also log to console for local development
    ],
});


const app = express();  // this must put before the cors

// Add static file serving before other middleware
app.use(express.static('html')); 

//app.use(cors());
//✅ Allow specific origins and methods
app.use(cors({
    origin: "*",  // Change to specific origin if needed (e.g., "http://localhost:8083")
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type"
}));
// ✅ Manually handle OPTIONS preflight requests
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
});


// app.use(bodyParser.urlencoded({ extended: true }));
// ✅ Middleware to parse JSON request body
app.use(bodyParser.json());
// const upload = multer();

// Add test endpoint
app.get('/api/test', (req, res) => {
    logger.info('Test endpoint accessed');
    res.json({
        status: 'success',
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});


// app.post("/send-email", upload.none(), async (req, res) => {
// Update the email endpoint to match the /api prefix
app.post("/api/send-email", async (req, res) => {
    const formType = req.body.formType;
     logger.info(`Received email request: FormType=${formType} host_ip=${HOST_IP}`);
     //console.log("Received data:", req.body);
     
    // Check if formType exists FIRST (before destructuring)
    if (!req.body.formType) {
        return res.status(400).json({ message: "formType is missing" });
    }

     let subject, formattedText;

     if (req.body.formType === "weddingForm") {
        const {  // Destructure the data for easier access
            maleName, femaleName, maleBirthDate, maleBirthTime, maleDateType,
            femaleBirthDate, femaleBirthTime, femaleDateType, maleFatherBirthDate,
            maleFatherDateType, maleMotherBirthDate, maleMotherDateType, femaleFatherBirthDate,
            femaleFatherDateType, femaleMotherBirthDate, femaleMotherDateType, grandfatherBirthDate,
            grandfatherDateType, grandmotherBirthDate, grandmotherDateType, weddingPeriod,
            preferredDays, fixedWeddingDate, otherMatters, phone, email
        } = req.body;
        queueCnt += 1;
        queueCntStr = queueCnt.toString().padStart(3, '0'); // Pad to 3 digits with leading zeros
        subject = `Wedding Form : ${maleName} ${femaleName}`;      

        // const formattedText = `
        formattedText = `
        Male Name: ${maleName}
        Female Name: ${femaleName}
        Male Birth Date: ${maleBirthDate} (${maleDateType}) ${maleBirthTime}
        Female Birth Date: ${femaleBirthDate} (${femaleDateType}) ${femaleBirthTime}
        Male Father Birth Date: ${maleFatherBirthDate} (${maleFatherDateType})
        Male Mother Birth Date: ${maleMotherBirthDate} (${maleMotherDateType})
        Female Father Birth Date: ${femaleFatherBirthDate} (${femaleFatherDateType})
        Female Mother Birth Date: ${femaleMotherBirthDate} (${femaleMotherDateType})
        Grandfather Birth Date: ${grandfatherBirthDate} (${grandfatherDateType})
        Grandmother Birth Date: ${grandmotherBirthDate} (${grandmotherDateType})
        Wedding Period: ${weddingPeriod}
        Preferred Days: ${preferredDays}
        Fixed Wedding Date: ${fixedWeddingDate}
        Other Matters: ${otherMatters}
        Phone: ${phone}
        Email: ${email}
    `;
        useremail = email;
        logger.info(`form content: FormType=${subject} ${formattedText} `);
    } else if (req.body.formType === "BZform") {
        const {
            gender1, name1, dateType1, birthdate1, birthtime1,
            gender2, name2, dateType2, birthdate2, birthtime2,othermatterbz,
            phone, email  //, formType // Include formType here if needed
        } = req.body;

        queueCnt += 1;
        queueCntStr = queueCnt.toString().padStart(3, '0'); // Pad to 3 digits with leading zeros
        saveFilename =`${queueCntStr}-${birthdate1}`;
        subject = `bz-2p : ${saveFilename}-${name1}`;

        const saveFilename1 = saveFilename +'-1';
        const hostip1 = `http://${HOST_IP}/${saveFilename1}.html`;

        saveFilename =`${queueCntStr}-${birthdate2}`;       
        const saveFilename2 = saveFilename +'-2';
        const hostip2 = `http://${HOST_IP}/${saveFilename2}.html`;

          formattedText = `
            Person 1:
            Gender: ${gender1}
            Name: ${name1}
            Date Type: ${dateType1}
            Birthdate: ${birthdate1}
            Birthtime: ${birthtime1}

            Person 2:
            Gender: ${gender2}
            Name: ${name2}
            Date Type: ${dateType2}
            Birthdate: ${birthdate2}
            Birthtime: ${birthtime2}
            Othermatter: ${othermatterbz} 

            Contact Information:
            Phone: ${phone}
            Email: ${email}
            click link : ${hostip1}
            click link : ${hostip2}
        `;
        useremail = email;
        logger.info(`form content: FormType=${subject} ${formattedText} `);

        const args1 = [`${saveFilename1}`, `${gender1}`, `${name1}`, `${dateType1}`, `${birthdate1}`, `${birthtime1}`, `${othermatterbz}`];
            // logger.info(`==make argArray==${args1.join(' ')}`);  // Logging the arguments properly
        runC8(args1);  // Pass the array directly

        const args2 = [`${saveFilename2}`, `${gender2}`, `${name2}`, `${dateType2}`, `${birthdate2}`, `${birthtime2}`, `${othermatterbz}`];
            // logger.info(`==make argArray==${args.join(' ')}`);  // Logging the arguments properly
        runC8(args2);  // Pass the array directly

    } else if (req.body.formType === "simpleForm") {
        // const { name, birthday, tel, email } = req.body;
        // logger.info(`Received email request: Inside FormType=${formType} `);
        const {
            gender1, name1, dateType1, birthdate1, birthtime1,othermatterbz,
            phone, email  //, formType // Include formType here if needed
        } = req.body;

        queueCnt += 1;
        queueCntStr = queueCnt.toString().padStart(3, '0'); // Pad to 3 digits with leading zeros
        saveFilename =`${queueCntStr}-${birthdate1}`;

        subject = `bz-1p : ${saveFilename}-${name1}`;
        const hostipall = `http://${HOST_IP}/${saveFilename}.html`;

        formattedText = `
            Gender: ${gender1}
            Name: ${name1}
            Date Type: ${dateType1}
            Birthdate: ${birthdate1}
            Birthtime: ${birthtime1}
            Othermatter: ${othermatterbz} 
            Contact Information:
            Phone: ${phone}
            Email: ${email}
            click link : ${hostipall}
    `;        
        useremail = email;
        logger.info(`form content: FormType=${subject} ${formattedText} `);


        // useremail='${email}';
        const args3 = [`${saveFilename}`,`${gender1}`, `${name1}`, `${dateType1}`, `${birthdate1}`, `${birthtime1}`, `Matter=${othermatterbz}`];
        // logger.info(`==construct arg==${args1.join(' ')}`);  // Logging the arguments properly
        runC8(args3);  // Pass the array directly

    } else   {
        return res.status(400).json({ message: `Invalid form type: ${req.body.formType}` }); 
        // return res.status(400).json({ message: "Invalid form type" });
    }

        var usermailbcc = "ywkwan@fookwing.com"

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: "fookwing238@gmail.com",
        // to: ["ywkwan@fookwing.com", "fookwing238@gmail.com", "info@fookwing.com"],
        cc : [ useremail  ],
        bcc: [ usermailbcc ],
        // cc: ["ywkwan@fookwing.com"],
        subject: subject,
        text: formattedText ,  //text
        // html : `<b>formattedText</b>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        // logger.info("Email sent successfully", { name, email }); // Log success
        logger.info("Email sent successfully", { maleName: req.body.maleName, femaleName: req.body.femaleName, email: req.body.email });
        res.json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        logger.error("Error sending email", { error: error, maleName: req.body.maleName, femaleName: req.body.femaleName, email: req.body.email }); // Log error
        res.status(500).json({ success: false, message: "Error sending email", error });
    }
});

function runC8(argsArray) {
    // Ensure all arguments are properly quoted
    const args = argsArray.map(arg => JSON.stringify(arg)).join(' ');
    logger.info(`ARGs=${args} `);
    const command = `node c8.js ${args}`;

    logger.info(`COmmand=${command} `);
    console.log(`Executing command: ${command}`); // Debugging output

    // Execute c8.js with arguments
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution Error: ${error.message}`);
            logger.info(`c8 error=${error.message} `);
            return;
        }
        console.log(`c8.js output:\n${stdout}`);
        logger.info(`c8.js output=${stdout} `);
        if (stderr) console.error(`c8.js error:\n${stderr}`);
    });
}

// app.listen(3000, () => {
//     logger.info("Server running on port 3000"); // Log server start
//    // setTimeout(() => process.exit(0), 100); // Allow logger to flush
//     console.log("Server running on port 3000");
// });

// const PORT = 3000;
// app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

// this is to add render.com port
// Update the port listening section at the bottom
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    logger.info(`API server running on port ${port}`);
    console.log(`API server running on port ${port}`);
});
