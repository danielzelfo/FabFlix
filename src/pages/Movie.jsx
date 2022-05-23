import React, { useState, useEffect }  from "react";
import { AppStyles } from "style/Styles";
import { View, Image, Text } from "react-native";
import {useParams} from "react-router-dom";
import {get_movie} from "backend/movies";
import {useUser} from "hook/User";

const Movie = () => {
    const {movie_id} = useParams()

    const {accessToken} = useUser();

    const [movieData, movieDataSetter] = useState({});

    useEffect(() => 
        get_movie(movie_id, accessToken)
            .then(response => movieDataSetter(response))
    , [movie_id, accessToken, movieDataSetter]);

    const currencyFormat = (num) => {
        const values = [1000000000, 1000000, 1000];
        const words = ["Billion", "Million", "Thousand"];
        for (let i = 0; i < values.length; ++i) {
            if (num >= values[i]) {
                return (num/values[i]).toPrecision(3)/1 + " " + words[i] + " USD";
            }
        }
        return num.toPrecision(3)/1 + " USD";
    }

    return (
        <View style={AppStyles.MainDiv}>
            {!!movieData.data &&
            <View style={AppStyles.VerticalDiv}>
                <Text style={AppStyles.H1Text}>{movieData.data.movie.title}</Text>
                <Text>{movieData.data.movie.year}</Text>
                <Text>{movieData.data.movie.director}</Text>

                <Image source={{uri: `https://image.tmdb.org/t/p/original${movieData.data.movie.backdropPath}`}} style={AppStyles.Backdrop} />
                
                <Text>{movieData.data.movie.rating}/10 ({movieData.data.movie.numVotes})</Text>
                <View style={AppStyles.HorizontalDivCenter}>
                    { movieData.data.genres.map( genre =>
                        <Text key={genre.id}> {genre.name} </Text>
                    ) }
                </View>

                <Text>{movieData.data.movie.overview}</Text>
                {movieData.data.movie.budget !== 0 && <Text>Budget: {currencyFormat(movieData.data.movie.budget)}</Text>}
                {movieData.data.movie.revenue !== 0 && <Text>Revenue: {currencyFormat(movieData.data.movie.revenue)}</Text>}

                <Text>Cast:</Text>
                <Text>{ movieData.data.persons.map( person => person.name ).join(', ') }</Text>

            </View>
            }
        </View>
    );
}

export default Movie;
