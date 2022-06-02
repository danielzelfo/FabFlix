import { Dimensions, Text, FlatList, StyleSheet, View, TouchableHighlight, Image, Button, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Picker } from '@react-native-picker/picker';
import { search_movies } from '../backend/movies';
import { useUser } from "../hook/User";

const movieDivider = () => {
    return (
        <View
            style={{
                height: 1,
                width: "100%",
                backgroundColor: "#607D8B",
            }}
        />
    );
}

const SearchScreen = ({ route, navigation }) => {

    const theme = useColorScheme();

    const { accessToken, refreshToken, setAccessToken } = useUser();

    const field_names = ["title", "year", "director", "genre", "page", "orderBy", "direction"];
    const default_field_values = ["", "", "", "", "1", "title", "ASC"]


    const { control, getValues, setValue, handleSubmit } = useForm();

    // current page response data
    const [results, resultsSetter] = useState([]);

    // current page request data
    const [pageData, pageDataSetter] = useState(undefined);

    const handleResultSuccess = (request, response) => {
        let movies = response.data.movies;
        if (movies === undefined)
            movies = [];
        // set results to show in html
        resultsSetter(movies);
        // save the last successful request data (used by next / prev buttons)
        pageDataSetter(request);
    }

    const handlePageResultSuccess = (request, response) => {
        // set the page if the response is not empty
        if (response.data.movies !== undefined) {
            handleResultSuccess(request, response);
            for (let i = 0; i < field_names.length; ++i) {
                setValue(field_names[i], request[field_names[i]] === undefined ? default_field_values[i] : "" + request[field_names[i]]);
            }
        } else {
            alert("Reached end of movies.")
        }
    }

    const handleException = (error) => {
        console.log(error);
        navigation.navigate("Login");
        setAccessToken(null);
    }

    const submitSearch = () => {
        const payLoad = {
            limit: 10
        }

        for (let i = 0; i < field_names.length; ++i) {
            let value = getValues(field_names[i]);
            if (value !== "" && !(default_field_values[i] !== "" && value === default_field_values[i]))
                payLoad[field_names[i]] = value;
        }

        search_movies(payLoad, accessToken)
            .then(response => handleResultSuccess(payLoad, response))
            .catch(error => handleException(error))
    }

    const submitPageSearch = (targetPage) => {
        // use current page request data / change page to target page
        const payLoad = {};
        Object.assign(payLoad, pageData);
        if (targetPage !== 1)
            payLoad.page = targetPage;
        else if (payLoad.page !== undefined)
            delete payLoad.page;

        search_movies(payLoad, accessToken)
            .then(response => handlePageResultSuccess(payLoad, response))
            .catch(error => handleException(error))
    }

    const nextPage = () => {
        // get page number from last successful request data
        let page = pageData.page;
        if (page === undefined)
            submitPageSearch(2); // undefined means page 1 (default)
        else
            submitPageSearch(page + 1);
    }
    const prevPage = () => {
        let page = pageData.page;
        if (page !== undefined && page !== 1) {
            submitPageSearch(page - 1);
        }
    }

    const styles = StyleSheet.create({
        screenContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: theme === 'light' ? '#EEEEEE' : '#222831'
        },
        HorizontalDivCenter: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme === 'light' ? '#EEEEEE' : "#222831"
        },
        PagingButton1: {
            justifyContent: "center",
            alignItems: "center",
            width: 75
        },
        PagingButton2: {
            justifyContent: "center",
            alignItems: "center",
            width: 75,
            marginLeft: (Dimensions.get('window').width - 250) / 2
        },
        PagingPage: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: 100,
            marginLeft: (Dimensions.get('window').width - 250) / 2
        },
        SelectStyle1: {
            width: 7 * Dimensions.get('window').width / 16,
            color: theme === 'light' ? "#222831" : "#EEEEEE"
        },
        SelectStyle2: {
            width: 5 * Dimensions.get('window').width / 16,
            color: theme === 'light' ? "#222831" : "#EEEEEE"
        },
        SubmitButton: {
            width: Dimensions.get('window').width / 4,
            height: 50
        },
        SubmitButtonBtn: {
            flexDirection: 'row',
            height: 46,
            backgroundColor: '#B55400',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
            borderRadius: 5,
            margin: 2
        },
        SubmitButtonTxt: {
            fontSize: 16,
            fontWeight: 'bold',
            color: "#EEEEEE"
        },
        SelectStyleItem: {
            fontSize: 14,
            height: "center",
            justifyContent: "center"
        },
        CustomInput: {
            alignItems: "center",
            justifyContent: "center",
            width: Dimensions.get('window').width / 4,
            color: theme === 'light' ? "#222831" : "#EEEEEE"
        },
        MovieSearchDetail: {
            width: 7 * Dimensions.get('window').width / 8 - 20,
        },
        view: {
            margin: 10,
        },
        movieContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: theme === 'light' ? '#EEEEEE' : '#393E46'
        },
        subContainer: {
            flex: 1,
        },
        buttonContainer: {
            margin: 20
        },
        input: {
            height: 40,
            margin: 12,
            borderWidth: 1,
            padding: 10,
        }, baseText: {
            fontFamily: "Cochin"
        },
        titleText: {
            fontSize: 20,
            fontWeight: "bold"
        },
        thumbnail: {
            width: Dimensions.get('window').width / 8,
            margin: 10,
        }
    });

    return (
        <View style={styles.screenContainer}>
            <View>
                <View style={styles.HorizontalDivCenter}>
                    <Controller name="title" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="title" placeholderTextColor="grey" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <Controller name="year" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="year" placeholderTextColor="grey" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <Controller name="director" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="director" placeholderTextColor="grey" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <Controller name="genre" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="genre" placeholderTextColor="grey" onChangeText={onChange} value={(value || "").toString()} />
                    )} />

                </View>
                <View style={styles.HorizontalDivCenter}>
                    <Controller name="orderBy" control={control} render={({ field: { value, onChange } }) => (
                        <Picker dropdownIconColor={theme === 'light' ? "#222831" : "#EEEEEE"} style={styles.SelectStyle1} onValueChange={onChange} selectedValue={(value || "title").toString()}>
                            <Picker.Item style={styles.SelectStyleItem} label="Sort by: title" value="title" />
                            <Picker.Item style={styles.SelectStyleItem} label="Sort by: rating" value="rating" />
                            <Picker.Item style={styles.SelectStyleItem} label="Sort by: year" value="year" />
                        </Picker>
                    )} />

                    <Controller name="direction" control={control} render={({ field: { value, onChange } }) => (
                        <Picker dropdownIconColor={theme === 'light' ? "#222831" : "#EEEEEE"} style={styles.SelectStyle2} onValueChange={onChange} selectedValue={(value || "ASC").toString()}>
                            <Picker.Item style={styles.SelectStyleItem} label="ASC" value="ASC" />
                            <Picker.Item style={styles.SelectStyleItem} label="DESC" value="DESC" />
                        </Picker>
                    )} />

                    <View style={styles.SubmitButton}>
                        <TouchableOpacity style={styles.SubmitButtonBtn} activeOpacity={0.75} onPress={handleSubmit(submitSearch)}>
                            <Text style={styles.SubmitButtonTxt}>Search</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <FlatList
                data={results}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.movieContainer}>
                        <TouchableHighlight
                            onPress={() => {
                                navigation.navigate("Movie", { movie_id: item.id })
                            }}
                            underlayColor={theme === 'light' ? "#EEEEEE" : "#222831"}>
                            <View style={styles.subContainer} flexDirection='row'>
                                <Image style={styles.thumbnail}
                                    source={{
                                        uri: `https://image.tmdb.org/t/p/w200${item.posterPath}`,
                                    }} />
                                <View style={styles.MovieSearchDetail}>
                                    <Text style={{ fontSize: 20, margin: 10, color: theme === 'light' ? "#222831" : "#EEEEEE" }}>
                                        {item.title}
                                    </Text>
                                    <Text style={{ fontSize: 16, margin: 10, color: theme === 'light' ? "#222831" : "#EEEEEE" }}>
                                        {item.year} - {item.director}
                                    </Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </View>
                )}
                ItemSeparatorComponent={movieDivider}
            />
            {results.length > 0 &&
                <View style={styles.HorizontalDivCenter} >
                    <View style={styles.PagingButton1}>
                        <Button color="#393E46" title="prev" onPress={prevPage} />
                    </View>
                    <View style={styles.PagingPage}>
                        <Text style={{ color: theme === 'light' ? "#222831" : "#EEEEEE" }}>Page</Text>
                        <Controller name="page" control={control} render={({ field: { value, onChange } }) => (
                            <TextInput style={{ color: theme === 'light' ? "#222831" : "#EEEEEE" }} placeholder="1" placeholderTextColor="grey" onChangeText={onChange} value={(value || "").toString()} />
                        )} />
                    </View>
                    <View style={styles.PagingButton2} >
                        <Button color="#393E46" style={{ color: "#222831" }} title="next" onPress={nextPage} />
                    </View>
                </View>
            }
        </View>
    );
};

export default SearchScreen;