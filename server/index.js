const express= require('express');
const cors= require('cors');
// const bodyParser =require('body-parser');
const SpotifyWebApi=require('spotify-web-api-node');
require('dotenv').config();
const lyricsFinder = require("lyrics-finder");
const app=express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))



app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        redirectUri:process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        refreshToken,
    })
  
    spotifyApi
      .refreshAccessToken()
      .then(data => {
        // console.log(data)
        console.log("Refresh is called on backend")
        res.json({
          accessToken: data.body.accessToken,
          expiresIn: data.body.expiresIn,
        })
      })
      .catch(err => {
        console.log(err)
        res.sendStatus(400)
      })
  })

app.post('/login' , (req,res)=>{
    const code=req.body.code
    // use Spotify Web Api Node Library to genrate acessToken,refreshToken,expiresIn
    const spotifyApi= new SpotifyWebApi({
        redirectUri:process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
    })
    spotifyApi
    .authorizationCodeGrant(code)
    .then(data=>{
        res.json({
            accessToken: data.body.access_token,
            refreshToken:data.body.refresh_token,
            expiresIn: data.body.expires_in,
        })
    })
    .catch((err)=>{
        // console.log(err)
        res.json({err:err})
    })
})

app.get("/lyrics", async (req, res) => {
  const lyrics =
    (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
  res.json({ lyrics })
})


app.listen(8000, () => {
  console.log('Server is running on port 8000');
});