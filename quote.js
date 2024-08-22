const nodemailer = require("nodemailer");
const { Pool } = require("pg");
require('dotenv').config();
let reciepientsArray = ['abrar.ali75@gmail.com',
'zayedali768@gmail.com', 'simeensheikh108@gmail.com', 'nihal.syed2012@gmail.com', 'ashhamareeb8@gmail.com', 'zakiramariam123@gmail.com', 'frkrocks@gmail.com', 'mohdismail767@gmail.com', 'md.ismail.rr@gmail.com']
let reciepients = reciepientsArray.toString();
let hadees_number;
let hadees_number_rowCount;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: "465",
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "Add your details here",
      pass: "add your details here",
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
    user: "postgres",
    host: "localhost",
    database: "your local testing db name here",
    password: "your pw here",
    port: "5432",
  });

  // used max=4341 as the Sunan Ibn Majah has 4341 hadees in the
  let randomNumber = getRandomInt(1, 4341);

  async function getHadeesDatafromPG() {
    try {
      const queryText = 'SELECT hadees_no FROM hadees_sent';
      const res = await pool.query(queryText);
      hadees_number = res.rows;
      hadees_number_rowCount = res.rowCount;
      // console.log(res.rows);
      console.log(hadees_number);
      console.log(hadees_number_rowCount);
    } catch (error) {
      console.log(`Error in getHadeesDatafromPG function: ${error}`);
    } 
  };

  getHadeesDatafromPG();

  async function addHadeesDatatoPG() {
    try {
      const queryText = `INSERT INTO hadees_sent (hadees_no) VALUES ('${randomNumber}')`;
      const res = await pool.query(queryText);
    } catch (error) {
      console.log(`Error in addHadeesDatatoPG function: ${error}`);
    }
  };


async function getQuote() {
    try {
        // removing fetching quotes as my montly api limit is exhausted, so only sending hadees.
        // const quoteResponse = await fetch('https://zenquotes.io/api/random');
        // const quoteData = await quoteResponse.json();


        // below is used to check if the randomNumber generated has already been used before or not
        for (let i = 0; i < hadees_number_rowCount; i++) {
          if (randomNumber === hadees_number[i].hadees_no) {
            randomNumber = getRandomInt(1, 4341);
            console.log(`the random number generated matched an already sent hadees no so the newly generated random number is ${randomNumber}`);
            addHadeesDatatoPG();
        };
      }

        //if the generated randomNumber hasn't been used, then I am logging it below and then added it to the db.
        console.log(`The random number generated ${randomNumber} was unqiue and wasn't found in the already sent hadees numbers and it will used to called the hadees api`);
        try {
          const queryText = `INSERT INTO hadees_sent (hadees_no) VALUES ('${randomNumber}')`;
          const res = await pool.query(queryText);
        } catch (error) {
          console.log(`Error while trying to insert the new random number into the DB: ${error}`);
        } finally {
          await pool.end();
        }

        const hadithResponse = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-ibnmajah/${randomNumber}.min.json`);
        const hadithData = await hadithResponse.json();
        let timestamp = new Date().toLocaleString();
        console.log
        (` ---------------------------------------**** Date triggered - ${timestamp} ****---------------------------------------`)
        console.log(`Hadith is from the book - ${hadithData.metadata.name},\nHadith Number - ${hadithData.hadiths[0].hadithnumber},\nHadees is - ${hadithData.hadiths[0].text}`);
        //  console.log(`Zen quote of the day: "${quoteData[0].q}" by "${quoteData[0].a}"`);

        let mailOptions = {
            from: '"ZenTimes" <abrar.ali75@gmail.com>', // sender address
            to: reciepients,
            subject: "[IMP] Shutting Down For Now!", // Subject line
            text: `Quotes of the day: Hadith is from the book - ${hadithData.metadata.name}, 
                   hadith Number - ${hadithData.hadiths[0].hadithnumber} and the hadees is 
                   - ${hadithData.hadiths[0].text}`, // plain text body


            //below html was directly added from the quote.html file in the directory, In this I have removed the 
            // div where you add quotes and just kept the hadees div.
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
                          <h1><u>Salam! I will be Stopping the Service for Now as I work on improving the user experience.</u></h1>
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







