const nodemailer = require("nodemailer");
const { Pool } = require("pg");
require('dotenv').config();
let reciepientsArray = ['abrar.ali75@gmail.com',
'zayedali768@gmail.com', 'simeensheikh108@gmail.com', 'nihal.syed2012@gmail.com', 'ashhamareeb8@gmail.com', 'zakiramariam123@gmail.com', 'frkrocks@gmail.com', 'mohdismail767@gmail.com', 'md.ismail.rr@gmail.com']
let reciepients = reciepientsArray.toString();
let hadees_number;
let hadees_number_rowCount;

  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.NODEMAILER_AUTH_USER,
      pass: process.env.NODEMAILER_AUTH_PW,
    },
  });

    // using this to generate a random hadees
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

  //connection to local postgres db
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
  });

  // used max=4321 as the Sunan Ibn Majah has 4341 hadees in the
  let randomNumber = getRandomInt(process.env.HADEES_START_NO, process.env.HADEES_END_NO);

  async function getHadeesDatafromPG() {
    try {
      const queryText = 'SELECT hadees_no FROM hadees_sent';
      const res = await pool.query(queryText);
      hadees_number = res.rows;
      hadees_number_rowCount = res.rowCount;
      console.log(res.rows);
      console.log(hadees_number);
      console.log(hadees_number_rowCount);
    } catch (error) {
      console.log(error);
    } 
  };

  getHadeesDatafromPG();

  async function addHadeesDatatoPG() {
    try {
      const queryText = `INSERT INTO hadees_sent (hadees_no) VALUES ('${randomNumber}')`;
      const res = await pool.query(queryText);
    } catch (error) {
      console.log(error);
    }
  };


async function getQuote() {
    try {
        const quoteResponse = await fetch('https://zenquotes.io/api/random');
        const quoteData = await quoteResponse.json();


        // below is used to check if the randomNumber generated has already been used before or not
        for (let i = 0; i < hadees_number_rowCount; i++) {
          if (randomNumber === hadees_number[i].hadees_no) {
            randomNumber = getRandomInt(1, 4341);
            console.log(`the random number generated matched an already sent hadees no so the newly generated random number is ${randomNumber}`);
            addHadeesDatatoPG();
        };
      }

        //if the generated randomNumber hasn't been used, then I am logging it below and then added it to the db.
        console.log(`the random number generated ${randomNumber} was unqiue and wasn't found in the already sent hadees numbers and it will used to called the hadees api`);
        try {
          const queryText = `INSERT INTO hadees_sent (hadees_no) VALUES ('${randomNumber}')`;
          const res = await pool.query(queryText);
        } catch (error) {
          console.log(error);
        } finally {
          await pool.end();
        }

        const hadithResponse = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-ibnmajah/${randomNumber}.min.json`);
        const hadithData = await hadithResponse.json();
        let timestamp = new Date().toLocaleString();
        console.log(`Date triggered - ${timestamp}`)
        console.log(`Hadith is from the book - ${hadithData.metadata.name}, hadith Number - ${hadithData.hadiths[0].hadithnumber} and the hadees is - ${hadithData.hadiths[0].text}`);
         console.log(`Zen quote of the day: "${quoteData[0].q}" by "${quoteData[0].a}"`);
        let mailOptions = {
            from: '"ZenTimes" <abrar.ali75@gmail.com>', // sender address
            to: 'abrar.ali75@gmail.com',
            subject: "Quotes of the Day🪷", // Subject line
            text: `Quotes of the day: Hadith is from the book - ${hadithData.metadata.name}, 
                   hadith Number - ${hadithData.hadiths[0].hadithnumber} and the hadees is 
                   - ${hadithData.hadiths[0].text}"${quoteData[0].q}" by "${quoteData[0].a}"`, // plain text body
            //below html was directly added from the quote.html file in the directory.
            html: 
                `<div class="container" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div class="header" 
                         style="width: 100%;
                         overflow: hidden;">
                         <img src="https://source.unsplash.com/600x200/?zen,nature" alt="Zen Image">
                    </div> 
                    <div class="content" style="padding: 20px;
                                text-align: center;">
                        <div>
                          <h1><u>Hadith of the Day</u></h1>
                        </div>
                        <div class="hadith" style="font-size: 24px;
                                color: #333333;
                                margin: 20px 0;">${hadithData.hadiths[0].text}
                        </div>
                        <div 
                                class="hadith-ref" 
                                style="font-size: 18px;
                                color: #777777;
                                margin-top: -10px;">- From "${hadithData.metadata.name}", No.${hadithData.hadiths[0].hadithnumber}
                        </div>
                        <div>
                          <h1><u>Quote of the Day</u></h1>
                        </div>
                        <div class="quote" style="font-size: 24px;
                                color: #333333;
                                margin: 20px 0;">${quoteData[0].q}
                        </div>
                        <div 
                            class="author" 
                            style="font-size: 18px;
                            color: #777777;
                            margin-top: -10px;">- ${quoteData[0].a}
                        </div>
                    </div>
                </div>`
        }
          // send mail with defined transport object
        const info = await transporter.sendMail(mailOptions)
        console.log("Message sent: %s", info.messageId);
        
    } catch (error) {
        console.log(error)
    }

}

getQuote();







