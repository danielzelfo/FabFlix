import React, { useState, useEffect } from "react";
import { Dimensions, ScrollView, StatusBar, View, Image, Text, StyleSheet, ImageBackground, useColorScheme } from "react-native";
import { get_movie } from "../backend/movies";
import { useUser } from "../hook/User";

const MovieScreen = ({ route, navigation }) => {

    const theme = useColorScheme();

    const { movie_id } = route.params;

    const { accessToken } = useUser();

    const [movieData, movieDataSetter] = useState(undefined);

    const [backgroundImg, setBackgroundImage] = useState("https://static.pexels.com/photos/1227/night-dark-blur-blurred.jpg")

    const image = { uri: backgroundImg }

    useEffect(() => {
        async function func() {
            get_movie(movie_id, accessToken)
                .then(response => { movieDataSetter(response.data); setBackgroundImage(`https://image.tmdb.org/t/p/original${response.data.movie.backdropPath}`) })
        }
        func();
    }, []);

    const currencyFormat = (num) => {
        const values = [1000000000, 1000000, 1000];
        const words = ["Billion", "Million", "Thousand"];
        for (let i = 0; i < values.length; ++i) {
            if (num >= values[i]) {
                return (num / values[i]).toPrecision(3) / 1 + " " + words[i] + " USD";
            }
        }
        return num.toPrecision(3) / 1 + " USD";
    }

    const styles = StyleSheet.create({
        ImpText: {
            color: theme === "light" ? "#222831" : "#EEEEEE",
        },
        RestText: {
            color: theme === "light" ? "grey" : "#EEEEEE"
        },
        DefaultDiv: {
            marginTop: 10,
            alignItems: "center"
        },
        GenresContainer: {
            display: "flex",
            flexDirection: "row",
            marginTop: 10,
            flexWrap: "wrap",
            justifyContent: "center"
        },
        Genre: {
            borderRadius: 10,
            padding: 5,
            margin: 2,
            backgroundColor: theme === "light" ? "rgba(34, 40, 49, .75)" : "rgba(181, 84, 0, .75)",
            color: "#EEEEEE"
        },
        MovieDetailContainer: {
            height: Dimensions.get('window').height - 125,
            width: Dimensions.get('window').width - 50,

        },
        MovieDetail: {
            backgroundColor: theme === "light" ? "rgba(255,255,255,.85)" : "#222831",
        },
        H1Text: {
            fontSize: 24,
            color: theme === "light" ? "#222831" : "#EEEEEE",
            fontWeight: "bold",
            textAlign: "center"
        },
        Backdrop: {
            width: Dimensions.get('window').width - 50 - 80,
            height: (Dimensions.get('window').width - 50 - 80) * 16 / 9,
            paddingBottom: StatusBar.currentHeight,
            resizeMode: "contain"
        },
        MovieMainDiv: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme === "light" ? "#EEEEEE" : "#222831"
        }
    });

    return (
        <ImageBackground source={image} resizeMode="cover" style={styles.MovieMainDiv}>
            {!!movieData &&
                <View style={styles.MovieDetailContainer}>
                    <ScrollView style={styles.MovieDetail}>
                        <View style={{ alignItems: "center", padding: 20 }}>
                            <Text style={styles.H1Text}>{movieData.movie.title}</Text>

                            <View style={styles.DefaultDiv}>
                                <Text style={styles.ImpText}>{movieData.movie.year}</Text>
                                <Text style={styles.ImpText}>{movieData.movie.director}</Text>
                            </View>
                            <Image source={{ uri: `https://image.tmdb.org/t/p/original${movieData.movie.posterPath}` }} style={styles.Backdrop} />

                            {movieData.movie.numVotes !== 0 && <Text style={styles.ImpText}>{movieData.movie.rating}/10 ({movieData.movie.numVotes})</Text>}
                            <View style={styles.GenresContainer}>
                                {movieData.genres.map(genre =>
                                    <Text key={genre.id} style={styles.Genre}> {genre.name} </Text>
                                )}
                            </View>

                            <View style={styles.DefaultDiv}>
                                <Text style={styles.RestText}>{movieData.movie.overview}</Text>
                            </View>

                            <View style={styles.DefaultDiv}>
                                {movieData.movie.budget !== 0 && <Text style={styles.RestText}>Budget: {currencyFormat(movieData.movie.budget)}</Text>}
                                {movieData.movie.revenue !== 0 && <Text style={styles.RestText}>Revenue: {currencyFormat(movieData.movie.revenue)}</Text>}
                            </View>

                            <View style={styles.DefaultDiv}>
                                <Text style={styles.RestText}>Cast:</Text>
                                <Text style={styles.RestText}>{movieData.persons.map(person => person.name).join(', ')}</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            }
        </ImageBackground>
    );
}


export default MovieScreen;