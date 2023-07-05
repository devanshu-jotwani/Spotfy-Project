import React from 'react'
import { useState,useEffect } from 'react';
import useAuth from '../../hooks/useAuth'
import Player from "./Player"
import TrackSearchResult from "./TrackSearchResult"
import SpotifyWebApi from 'spotify-web-api-node';
import { Container, Form } from "react-bootstrap"
import axios from "axios"

export default function Dashboard({code}) {
  const accessToken=useAuth(code);
  // console.log(accessToken);
  const spotifyApi = new SpotifyWebApi({
    clientId: "462db089676841bc804021cdf7573aa0",
  })

  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track) {
    setPlayingTrack(track)
    setSearch("")
    setLyrics("")
  }
// Get lyrics of currently playing song.
  useEffect(() => {
    if (!playingTrack) return

    axios
      .get("http://localhost:8000/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then(res => {
        setLyrics(res.data.lyrics)
      })
  }, [playingTrack,spotifyApi])

  useEffect(() => {
    if (!accessToken) return
    spotifyApi.setAccessToken(accessToken)
  }, [accessToken,spotifyApi])

  useEffect(() => {
    if (!search) return setSearchResults([])
    if (!accessToken) return

    let cancel = false
    spotifyApi.searchTracks(search).then(res => {
      if (cancel) return
      setSearchResults(
        res.body.tracks.items.map(track => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image
              return smallest
            },
            track.album.images[0]
          );
          const largestAlbumImage = track.album.images.reduce(
            (largest, image) => {
              if (image.height > largest.height) return image
              return largest
            },
            track.album.images[0]
          )
          

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
            largest: largestAlbumImage.url
          }
        })
      )
    })

    return () => (cancel = true)
  }, [search, accessToken])

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
    <Form.Control
      type="search"
      placeholder="Search Songs/Artists"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
      {searchResults.map(track => (
        <TrackSearchResult
          track={track}
          key={track.uri}
          chooseTrack={chooseTrack}
        />
      ))}
      {searchResults.length === 0 && (
        <div className="text-center" style={{ whiteSpace: "pre" }}>
          {lyrics==='No Lyrics Found' ?<img src={playingTrack.largest} style={{ height: "400px", width: "400px" }} />:lyrics}
        </div>
      )}
    </div>
    <div>
      <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
    </div>
  </Container>
)}
