const nodemailer = require("nodemailer");
let reciepientsArray = ['abrar.ali75@gmail.com',
'zayedali768@gmail.com', 'simeensheikh108@gmail.com', 'nihal.syed2012@gmail.com', 'ashhamareeb8@gmail.com', 'zakiramariam123@gmail.com']
let reciepients = reciepientsArray.toString();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: 'abrar.ali75@gmail.com',
      pass: 'saejwrjyxopcjdpr',
    },
  });

  //using this to generate a random hadees
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // used max=4321 as the inb majah has 4341 hadees in them
  // This below code snippet to store the random numbers doesn't work because the 
  //randomArray gets initialised everytime we run the code, so need to store that data
  //in a db and fetch it everytime we want to check if the hadees number would be repeated
  //or not

  let randomArray = []; 
  let randomNumber = getRandomInt(1, 4341);
  randomArray.push(JSON.parse(JSON.stringify(randomNumber))); //this deep copies the randomNumber object
  

  //TODO
  //1.Add the randomNumber generated on each execution to an array and add logic to before trigerring the hadees api
  // that if the hadees number has been generated before then we should generate a new number.
  //2. Figure out a way to get the total number of hadees from the endpoint

async function getQuote() {
    try {
        const quoteResponse = await fetch('https://zenquotes.io/api/random');
        const quoteData = await quoteResponse.json();
        const hadithResponse = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-ibnmajah/${randomNumber}.min.json`);
        const hadithData = await hadithResponse.json();
        let timestamp = new Date().toLocaleString();
        console.log(`Date triggered - ${timestamp}`)
        console.log(`Hadith is from the book - ${hadithData.metadata.name}, hadith Number - ${hadithData.hadiths[0].hadithnumber} and the hadees is - ${hadithData.hadiths[0].text}`);
         console.log(`Zen quote of the day: "${quoteData[0].q}" by "${quoteData[0].a}"`);
        let mailOptions = {
            from: '"ZenTimes" <abrar.ali75@gmail.com>', // sender address
            to: reciepients,
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







