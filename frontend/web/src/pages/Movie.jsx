import React, { useState, useEffect }  from "react";
import { AppStyles } from "style/Styles";
import { View, Image, Text, Button, TextInput} from "react-native";
import {useParams} from "react-router-dom";
import {get_movie} from "backend/movies";
import {useUser} from "hook/User";
import {useForm, Controller} from "react-hook-form";
import {useCart} from "hook/Cart";

const Movie = () => {
    const {movie_id} = useParams();

    const {accessToken} = useUser();

    const {addToCart} = useCart();

    const [movieData, movieDataSetter] = useState(undefined);

    // [text, color]
    const [submitMessage, submitMessageSetter] = useState(["", ""]);

    const {control, getValues, handleSubmit} = useForm();

    const [backgroundImg, setBackgroundImage] = useState("url(https://i.imgur.com/sx7uw26.jpg)")
    var MovieMainDiv = {
        width: "100%",
        position: "fixed",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: backgroundImg,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "calc(100vh - 51px)",
        marginTop: "1px"
    }

    useEffect(() => 
        get_movie(movie_id, accessToken)
            .then(response => {movieDataSetter(response.data); setBackgroundImage(`url(https://image.tmdb.org/t/p/original${response.data.movie.backdropPath})`)})
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
    , []);

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
    const submitAddToCart = () => {
        let quantity = getValues("quantity");

        if (quantity === "0")
            return;
        if (quantity === undefined)
            quantity = 1;
        else
            quantity = parseInt(quantity);
        
        addToCart(parseInt(movie_id), quantity)
            .then(new_quantity => submitMessageSetter([new_quantity !== quantity ? "Updated quantity to " + new_quantity + "." : "Added " + quantity + " to cart.", "blue"]))
            .catch(err => submitMessageSetter([err.message, "red"]));
    }

    return (
        <View style={MovieMainDiv}>
            {!!movieData &&
            <View style={AppStyles.MovieDetail}>
                <Text style={AppStyles.H1Text}>{movieData.movie.title}</Text>
                <Text>{movieData.movie.year}</Text>
                <Text>{movieData.movie.director}</Text>

                <Image source={{uri: `https://image.tmdb.org/t/p/original${movieData.movie.posterPath}`}} style={AppStyles.MoviePoster} />
                
                <Text>{movieData.movie.rating}/10 ({movieData.movie.numVotes})</Text>
                <View style={AppStyles.HorizontalDivCenter}>
                    { movieData.genres.map( genre =>
                        <Text key={genre.id}> {genre.name} </Text>
                    ) }
                </View>

                <Text>{movieData.movie.overview}</Text>
                {movieData.movie.budget !== 0 && <Text>Budget: {currencyFormat(movieData.movie.budget)}</Text>}
                {movieData.movie.revenue !== 0 && <Text>Revenue: {currencyFormat(movieData.movie.revenue)}</Text>}

                <Text>Cast:</Text>
                <Text>{ movieData.persons.map( person => person.name ).join(', ') }</Text>
                
                <Controller name="quantity" control={control} render={ ({ field: { value, onChange } }) => (
                    <TextInput style={AppStyles.CustomInput} placeholder="quantity" onChangeText={onChange} value={value || "1"} />
                )} />
                <Button title="Add to cart" onPress={handleSubmit(submitAddToCart)} />

                {submitMessage && (
                    <Text style={{color: submitMessage[1]}}>{submitMessage[0]}</Text>
                )}

            </View>
            }
        </View>
    );
}

export default Movie;
