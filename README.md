# Hvað er í bíó?

## About
Hvað er í bíó? is a webapp that list all movie screenings in theaters in Iceland. The app is focused on providing an excelent user experience and solving the problem – finding a movie to see – in a efficient and intuitive manner.

## Data
Data sources:
Right now all the data comes from apis.is/cinema which relies on kvikmyndir.is but the plan is to fetch it from it's sources:
Sambíó http://www.sambio.is/xml/Schedule/
Midi.is: in arrangements about api key
Selfossbíó: has not yet made an api (and is not in the current data)

The data should be gathered in a single JSON file with the following stricture:
    "2014-03-15": [
        {
            "title": "The Lego Movie",
            "year": "2014",
            "length": "100",
            "imdbUrl": "http://imdb.com/1337",
            "imgSmallUrl": "/posters/the-lego-movie-small.jpg",
            "imgLargeUrl": "/posters/the-lego-movie-large.jpg",
            "trailerUrl": "http://www.youtube.com/watch?v=fZ_JOBCLF-I",
            "restriction": "12",
            "ratings": [
                {
                    "source": "imdb",
                    "rating": "5.5",
                    "top": "10.0",
                    "votes": "14323"
                }
            ],
            "showtimes": [
                { 
                    "theater": "Kringlan",
                    "schedule": [
                        {
                            "time": "20:00",
                            "auditorium": "2",
                            "extra": "3D",
                            "buyUrl": "http://www.sambio.is/Websales/Show/164157/"
                        }
                    ]
                }
            ]
        }
    ]



## Copyright
© 2014 Hugi Hlynsson – all right reserved
