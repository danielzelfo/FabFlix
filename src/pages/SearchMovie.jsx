import React, { useState }  from "react";
import {useForm} from "react-hook-form";
import {search_movies} from "backend/movies";
import {useUser} from "hook/User";
import { useNavigate } from "react-router-dom";
import { View, Text, Button, TextInput } from "react-native";
import {Picker} from '@react-native-picker/picker';
import {AppStyles} from "style/Styles";
import {Link} from "react-router-dom";


const SearchMovie = () => {
    const field_names = ["title", "year", "director", "genre", "limit", "page", "orderBy", "direction"];
    const default_field_values = ["", "", "", "", "10", "1", "title", "ASC"]

    const navigate = useNavigate();

    const {
        accessToken, setAccessToken
    } = useUser();

    const {register, getValues, setValue, handleSubmit} = useForm();

    // current page response data
    const [results, resultsSetter] = useState([]);

    // current page request data
    const [pageData, pageDataSetter] = useState({});

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
            for(let i = 0; i < field_names.length; ++i) {
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

        for(let i = 0; i < field_names.length; ++i) {
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
                <Text style={AppStyles.H1Text}>Search Movie</Text>
                <View style={AppStyles.HorizontalDivRight}>
                    <Picker style={AppStyles.SelectStyle} {...register("limit")}>
                        <Picker.Item label="Limit: 10" value="10" />
                        <Picker.Item label="Limit: 25" value="25" />
                        <Picker.Item label="Limit: 50" value="50" />
                        <Picker.Item label="Limit: 100" value="100" />
                    </Picker>
                    <Picker style={AppStyles.SelectStyle} {...register("orderBy")}>
                        <Picker.Item label="Sort by: title" value="title" />
                        <Picker.Item label="Sort by: rating" value="rating" />
                        <Picker.Item label="Sort by: year" value="year" />
                    </Picker>
                    <Picker style={AppStyles.SelectStyle} {...register("direction")}>
                        <Picker.Item label="Direction: ASC " value="ASC" />
                        <Picker.Item label="Direction: DESC" value="DESC" />
                    </Picker>
                </View>
                <View style={AppStyles.HorizontalDivCenter}>
                    <TextInput style={AppStyles.CustomInput} placeholder="title" {...register("title")} />
                    <TextInput style={AppStyles.CustomInput} placeholder="year" {...register("year")} />
                    <TextInput style={AppStyles.CustomInput} placeholder="director" {...register("director")} />
                    <TextInput style={AppStyles.CustomInput} placeholder="genre" {...register("genre")} />
                    <Button title="Search" onPress={handleSubmit(submitSearch)} />
                </View>
                <View style={AppStyles.HorizontalDivRight}>
                    <Text>Page</Text>
                    <TextInput style={AppStyles.CustomInputNum} placeholder="1" {...register("page")}/>
                </View>
            </View>
            
            {
            results.length > 0 ?
                <View style={AppStyles.ResultContainerDiv}>
                    <View style={AppStyles.ResultTable}>
                        <View style={AppStyles.ResultBody}>
                            <View style={AppStyles.ResultRow}>
                                <View style={AppStyles.ResultCell1}><Text style={AppStyles.BoldCenteredText}>Title</Text></View>
                                <View style={AppStyles.ResultCell23}><Text style={AppStyles.BoldCenteredText}>Year</Text></View>
                                <View style={AppStyles.ResultCell23}><Text style={AppStyles.BoldCenteredText}>Director</Text></View>
                            </View>
                        {
                        results.map( result =>
                            <View style={AppStyles.ResultRow} key={result.id}>
                                <View style={AppStyles.ResultCell1}><Link to={`/movie/${result.id}`}><Text style={AppStyles.ResultCellText}>{result.title}</Text></Link></View>
                                <View style={AppStyles.ResultCell23}><Text style={AppStyles.ResultCellText}>{result.year}</Text></View>
                                <View style={AppStyles.ResultCell23}><Text style={AppStyles.ResultCellText}>{result.director}</Text></View>
                            </View>
                        )
                        }
                        </View>
                    </View>
                    <View style={AppStyles.HorizontalDivCenterDown}>
                        <Button title="prev" onPress={prevPage} />
                        <Button title="next" onPress={nextPage} />
                    </View>
                </View>
            :
                <View style={AppStyles.ResultContainerDiv}>
                    <View style={AppStyles.ResultTable}>
                        <View style={AppStyles.ResultBody}>
                            <View style={AppStyles.ResultRow} >
                                <View style={AppStyles.ResultCell1} >
                                    <Text style={AppStyles.ResultCellTextCentered}>No results</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            }
        </View>
    );
}

export default SearchMovie;
