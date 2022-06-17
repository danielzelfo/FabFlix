import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { search_movies } from "backend/movies";
import { useUser } from "hook/User";
import { useNavigate } from "react-router-dom";
import { View, Text, Button, TextInput, Image } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { AppStyles } from "style/Styles";
import { Link } from "react-router-dom";


const Home = () => {
    const field_names = ["title", "year", "director", "genre", "limit", "page", "orderBy", "direction"];
    const default_field_values = ["", "", "", "", "10", "1", "title", "ASC"]

    const navigate = useNavigate();

    const {
        accessToken, setAccessToken
    } = useUser();

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
                setValue(field_names[i], request[field_names[i]] === undefined ? default_field_values[i] : request[field_names[i]]);
            }
        }
    }

    const handleException = (error) => {
        navigate("/login");
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
        <View style={AppStyles.MainDiv}>
            <View style={AppStyles.VerticalDiv}>
                <Text style={AppStyles.H1Text}>FabFlix</Text>
                <View style={AppStyles.HorizontalDivRight}>
                    <Controller name="limit" control={control} render={({ field: { value, onChange } }) => (
                        <Picker style={AppStyles.SelectStyle} onValueChange={onChange} value={value || "10"}>
                            <Picker.Item label="Limit: 10" value="10" />
                            <Picker.Item label="Limit: 25" value="25" />
                            <Picker.Item label="Limit: 50" value="50" />
                            <Picker.Item label="Limit: 100" value="100" />
                        </Picker>
                    )} />

                    <Controller name="orderBy" control={control} render={({ field: { value, onChange } }) => (
                        <Picker style={AppStyles.SelectStyle} onValueChange={onChange} value={value || "title"}>
                            <Picker.Item label="Sort by: title" value="title" />
                            <Picker.Item label="Sort by: rating" value="rating" />
                            <Picker.Item label="Sort by: year" value="year" />
                        </Picker>
                    )} />

                    <Controller name="direction" control={control} render={({ field: { value, onChange } }) => (
                        <Picker style={AppStyles.SelectStyle} onValueChange={onChange} value={value || "ASC"}>
                            <Picker.Item label="Direction: ASC " value="ASC" />
                            <Picker.Item label="Direction: DESC" value="DESC" />
                        </Picker>
                    )} />
                </View>
                <View style={AppStyles.HorizontalDivCenter}>
                    <Controller name="title" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={AppStyles.CustomInput} placeholder="title" onChangeText={onChange} value={value || ""} />
                    )} />
                    <Controller name="year" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={AppStyles.CustomInput} placeholder="year" onChangeText={onChange} value={value || ""} />
                    )} />
                    <Controller name="director" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={AppStyles.CustomInput} placeholder="director" onChangeText={onChange} value={value || ""} />
                    )} />
                    <Controller name="genre" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={AppStyles.CustomInput} placeholder="genre" onChangeText={onChange} value={value || ""} />
                    )} />
                    <Button title="Search" onPress={handleSubmit(submitSearch)} />
                </View>
                <View style={AppStyles.HorizontalDivRight}>
                    <Text>Page</Text>
                    <Controller name="page" control={control} render={({ field: { value, onChange } }) => (
                        <TextInput style={AppStyles.CustomInputNum} placeholder="1" onChangeText={onChange} value={value || ""} />
                    )} />
                </View>
            </View>

            {
                results.length > 0 ?
                    <View style={AppStyles.ResultContainerDiv}>
                        <View style={AppStyles.ResultsContainer}>
                            {
                                results.map(result =>
                                    <Link to={`/movie/${result.id}`}>
                                        <Image source={{ uri: `https://image.tmdb.org/t/p/original${result.posterPath}` }} style={AppStyles.Poster} />
                                    </Link>
                                )
                            }
                        </View>
                        <View style={AppStyles.HorizontalDivCenterDown}>
                            <Button title="prev" onPress={prevPage} />
                            <Button title="next" onPress={nextPage} />
                        </View>
                    </View>
                    :

                    !pageData ?
                        <View></View>
                        :
                        <View style={AppStyles.ResultContainerDiv}>
                            <Text>No results</Text>         
                        </View>

            }
        </View>
    );
}

export default Home;
