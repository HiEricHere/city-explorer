'use strict'

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// Routes
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/events', getEvent);
app.get('/movies', getMovie);
app.get('/yelp', getYelp);
app.get('/trails', getTrail);

// Location //--------------------------------------------------------------------------------------------------------------------------

function getLocation( request, response ){

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get( url )
    .then ( rawData => {
      let locationData = new Location ( request.query.data, rawData.body.results[0] );
      response.send( locationData );
    }) .catch (error => {
      response.send(error);
    })

}

function Location ( query, data ){

  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;

}

// Weather //--------------------------------------------------------------------------------------------------------------------------

function getWeather( request, response ){

  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  return superagent.get( url )
    .then( rawData => {
      let weatherData = rawData.body.daily.data.map( day => new Weather( day ) );
      response.send( weatherData );
    }).catch( error => {
      response.send(error);
    })

}

function Weather( day ){

  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);

}

// Events //--------------------------------------------------------------------------------------------------------------------------

function getEvent( request, response ){

  const url = `https://www.eventbriteapi.com/v3/events/search?location.latitude=${request.query.data.latitude}&location.longitude=${request.query.data.longitude}&token=${process.env.EVENTBRITE_API_KEY}`;

  return superagent.get( url )
    .then( rawData => {
      let eventData = rawData.body.events.map( event => new Event( event ) );
      response.send( eventData );
    }).catch( error => {
      response.send( error );
    });
}

function Event( event ){

  this.link = event.url;
  this.name = event.name.text;
  this.event_date = event.start.local;
  this.summary = event.summary;

}

// Movies // --------------------------------------------------------------------------------------------------------------------------

function getMovie( request, response ){

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request.query.data.search_query}`;

  return superagent.get( url )
    .then( rawData => {
      let movieData = rawData.body.results.map( movie => new Movie( movie ) );
      response.send( movieData );
    }).catch(error => {
      response.send( error );
    });

}

function Movie( movie ){

  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;

}

// Yelp // --------------------------------------------------------------------------------------------------------------------------

function getYelp( request, response ){
  console.log(request.query);
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.data.latitude}&longitude=${request.query.data.longitude}`;

  return superagent.get(url).set({ 'Authorization': `Bearer ${process.env.YELP_API_KEY}`})
    .then( rawData => {
      response.send( rawData.body.businesses.map( business => new Restaurant( business ) ) );
    }).catch( error => response.send( error ) );

}

function Restaurant( business ){

  this.name = business.name,
  this.image_url = business.image_url,
  this.price = business.price,
  this.rating = business.rating,
  this.url = business.url

}

// Hiking // --------------------------------------------------------------------------------------------------------------------------

function getTrail( request, response ){

  let url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&key=${process.env.TRAIL_API_KEY}`;

  superagent.get(url)
    .then( rawData => {
      response.send( rawData.body.trails.map( trail => new Trail( trail ) ) );
    }).catch( error => response.send( error ) );

}

function Trail ( trail ){

  this.name = trail.name,
  this.location = trail.location,
  this.length = trail.length,
  this.stars = trail.stars,
  this.star_votes = trail.starVotes,
  this.summary = trail.summary,
  this.trail_url = trail.url,
  this.conditions = `${trail.conditionStatus}. ${trail.conditionDetails}.`,
  this.condition_date = `${trail.conditionDate.split(' ')[0]}`,
  this.condition_time = `${trail.conditionDate.split(' ')[1]}`

}



app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
