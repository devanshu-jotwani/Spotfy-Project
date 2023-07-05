import  { useEffect, useState } from 'react';
import axios from 'axios';
// store accesstoken,refreshtoken and expires in
export default function useAuth(code) {
  const [accessToken,setAccessToken]= useState();
  const [refreshToken,setRefreshToken]=useState();
  const [expiresIn, setExpiresIn]=useState();

  useEffect(() => {
    axios
      .post("http://localhost:8000/login", {
        code
      })
      .then(res => {
        // console.log(res);
        setAccessToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        setExpiresIn(res.data.expiresIn)
        
        window.history.pushState({}, null, "/")
      })
      .catch((err) => {
        // if (!err) console.log(err)
        window.location = "/"
      })
  }, [code])

  useEffect(() => {
    if (!refreshToken || !expiresIn) return
    const interval = setInterval(() => {
      axios
        .post("http://localhost:8000/refresh", {
          refreshToken,
        })
        .then(res => {
          console.log("Caling Refresh Backend enpoint")
          setAccessToken(res.data.accessToken)
          setExpiresIn(61)
          // setExpiresIn(res.data.expiresIn)
        })
        .catch(() => {
          window.location = "/"
        })
    }, (expiresIn - 60) * 1000)

    return () => clearInterval(interval)
  }, [refreshToken, expiresIn])
  
  return accessToken
}
