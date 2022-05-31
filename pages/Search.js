import { Dimensions, Text, FlatList, StyleSheet, View, TouchableHighlight, Image, Button, TextInput } from 'react-native';
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Picker } from '@react-native-picker/picker';
import { search_movies } from '../backend/movies';
import { HorizontalDivStyle } from '../styles/styles';

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
    const { accessToken, refreshToken } = route.params;

    const field_names = ["title", "year", "director", "genre", "limit", "page", "orderBy", "direction"];
    const default_field_values = ["", "", "", "", "10", "1", "title", "ASC"]


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
        }
    }

    const handleException = (error) => {
        console.log(error);
        navigation.navigate("Login");
        setAccessToken(null);
    }

    const submitSearch = () => {
        const payLoad = {}

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
            submitPageSearch(2) // undefined means page 1 (default)
        else
            submitPageSearch(page + 1)
    }
    const prevPage = () => {
        let page = pageData.page;
        if (page !== undefined && page !== 1) {
            submitPageSearch(page - 1);
        }
    }

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.HorizontalDivCenter}>
                    <Controller name="title" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="title" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <Controller name="year" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="year" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <Controller name="director" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="director" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <Controller name="genre" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={styles.CustomInput} placeholder="genre" onChangeText={onChange} value={(value || "").toString()} />
                    )} />
                    <View style={styles.CustomInput}>
                        <Button title="Search" onPress={handleSubmit(submitSearch)} />
                    </View>
                </View>
                <View style={styles.HorizontalDivCenter}>
                    <Controller name="limit" control={control} render={({ field: { value, onChange } }) => (
                        <Picker style={styles.SelectStyle1} onValueChange={onChange} value={(value || "10").toString()}>
                            <Picker.Item style={styles.SelectStyleItem} label="Limit: 10" value="10" />
                            <Picker.Item style={styles.SelectStyleItem} label="Limit: 25" value="25" />
                            <Picker.Item style={styles.SelectStyleItem} label="Limit: 50" value="50" />
                            <Picker.Item style={styles.SelectStyleItem} label="Limit: 100" value="100" />
                        </Picker>
                    )} />

                    <Controller name="orderBy" control={control} render={({ field: { value, onChange } }) => (
                        <Picker style={styles.SelectStyle1} onValueChange={onChange} value={(value || "title").toString()}>
                            <Picker.Item style={styles.SelectStyleItem} label="Sort by: title" value="title" />
                            <Picker.Item style={styles.SelectStyleItem} label="Sort by: rating" value="rating" />
                            <Picker.Item style={styles.SelectStyleItem} label="Sort by: year" value="year" />
                        </Picker>
                    )} />

                    <Controller name="direction" control={control} render={({ field: { value, onChange } }) => (
                        <Picker style={styles.SelectStyle2} onValueChange={onChange} value={(value || "ASC").toString()}>
                            <Picker.Item style={styles.SelectStyleItem} label="ASC" value="ASC" />
                            <Picker.Item style={styles.SelectStyleItem} label="DESC" value="DESC" />
                        </Picker>
                    )} />
                </View>
            </View>
            <FlatList
                data={results}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.container}>
                        <TouchableHighlight
                            onPress={() => {
                                alert("Key: " + item.id + "\nValue: " + item.title);
                            }}
                            underlayColor="white">
                            <View style={styles.subContainer} flexDirection='row'>
                                <Image style={styles.thumbnail}
                                    source={{
                                        uri: `https://image.tmdb.org/t/p/w200${item.posterPath}`,
                                    }} />
                                <View style={styles.MovieSearchDetail}>
                                    <Text style={{ fontSize: 20, margin: 10 }}>
                                        {item.title}
                                    </Text>
                                    <Text style={{ fontSize: 16, margin: 10 }}>
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
                        <Button color="#841584" title="prev" onPress={prevPage} />
                    </View>
                    <View style={styles.PagingPage}>
                        <Text>Page</Text>
                        <Controller name="page" control={control} render={({ field: { value, onChange } }) => (
                            <TextInput placeholder="1" onChangeText={onChange} value={(value || "").toString()} />
                        )} />
                    </View>
                    <View style={styles.PagingButton2} >
                        <Button color="#841584" title="next" onPress={nextPage} />
                    </View>
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    HorizontalDivCenter: {
        ...HorizontalDivStyle,
        justifyContent: "center",
        alignItems: "center"
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
        ...HorizontalDivStyle,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        marginLeft: (Dimensions.get('window').width - 250) / 2
    },
    SelectStyle1: {
        backgroundColor: "white",
        width: 11 * Dimensions.get('window').width / 32
    },
    SelectStyle2: {
        backgroundColor: "white",
        width: 5 * Dimensions.get('window').width / 16
    },
    SelectStyleItem: {
        fontSize: 14
    },
    CustomInput: {
        alignItems: "center",
        justifyContent: "center",
        width: Dimensions.get('window').width / 5
    },
    MovieSearchDetail: {
        width: 7*Dimensions.get('window').width/8 - 20,
    },
    view: {
        margin: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
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
        width: Dimensions.get('window').width/8,
        margin: 10,
    }
});


export default SearchScreen;