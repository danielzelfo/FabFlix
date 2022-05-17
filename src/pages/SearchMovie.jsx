import React, { useState }  from "react";
import {useForm} from "react-hook-form";
import {search_backend} from "backend/movies";
import {useUser} from "hook/User";
import { useNavigate } from "react-router-dom";
import { StyleSheet, View, Text, Button, TextInput } from "react-native";
import {Picker} from '@react-native-picker/picker';

const HorizontalDivStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "5px",
    width: "100%"
}

const ResultCellStyle = {
    border: "1px solid #eee",
    display: "table-cell",
    padding: "3px 10px"
}

const CustomInputStyle = {
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "7.5px",
    padding: "2.5px",
    paddingLeft: "10px",
    paddingRight: "10px"
}

const styles = StyleSheet.create({
    MainDiv: {
        width: "calc(100% - 50px)"
    },
    VerticalDiv: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center"
    },
    HorizontalDivCenter: {
        ...HorizontalDivStyle,
        justifyContent: "center"
    },
    HorizontalDivCenterDown: {
        ...HorizontalDivStyle,
        marginTop: "50px", 
        justifyContent: "center"
    },
    HorizontalDivRight: {
        ...HorizontalDivStyle,
        justifyContent: "right"
    },
    ResultTable: {
        marginTop: "50px",
        display: "table",
        boxShadow: "0 2px 10px rgb(0 0 0 / 20%)",
        width: "100%"
    },
    ResultRow: {
        display: "table-row"
    },
    ResultCell1: {
        ...ResultCellStyle,
        width: "60%"
    },
    ResultCell23: {
        ...ResultCellStyle,
        width: "20%"
    },
    ResultCellText: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    ResultCellTextCentered: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "flex",
        justifyContent: "center"
    },
    H1Text: {
        display: "block",
        fontSize: "2em",
        marginTop: "0.67em",
        marginBottom: "0.67em",
        marginLeft: "0",
        marginRight: "0",
        fontWeight: "bold"
    },
    BoldCenteredText: {
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center"
    },
    SelectStyle: {
        backgroundColor: "white",
        border: "1px solid black",
        borderRadius: "7.5px",
        padding: "2.5px",
        paddingLeft: "10px",
        paddingRight: "10px"
    },
    ResultBody: {
        display: "table-row-group"
    },
    CustomInput: {
        ...CustomInputStyle
    },
    CustomInputNum: {
        ...CustomInputStyle,
        width: "4em"
    }
});


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
        setAccessToken(null);
        navigate("/login");
    }

    const submitSearch = () => {
        const payLoad = {}

        for(let i = 0; i < field_names.length; ++i) {
            let value = getValues(field_names[i]);
            if (value !== "" && !(default_field_values[i] !== "" && value === default_field_values[i]))
                payLoad[field_names[i]] = value;
        }

        search_backend(payLoad, accessToken)
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
        
        search_backend(payLoad, accessToken)
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
        <View style={styles.MainDiv}>
            <View style={styles.VerticalDiv}>
                <Text style={styles.H1Text}>Search Movie</Text>
                <View style={styles.HorizontalDivRight}>
                    <Picker style={styles.SelectStyle} {...register("limit")}>
                        <Picker.Item label="Limit: 10" value="10" />
                        <Picker.Item label="Limit: 25" value="25" />
                        <Picker.Item label="Limit: 50" value="50" />
                        <Picker.Item label="Limit: 100" value="100" />
                    </Picker>
                    <Picker style={styles.SelectStyle} {...register("orderBy")}>
                        <Picker.Item label="Sort by: title" value="title" />
                        <Picker.Item label="Sort by: rating" value="rating" />
                        <Picker.Item label="Sort by: year" value="year" />
                    </Picker>
                    <Picker style={styles.SelectStyle} {...register("direction")}>
                        <Picker.Item label="Direction: ASC " value="ASC" />
                        <Picker.Item label="Direction: DESC" value="DESC" />
                    </Picker>
                </View>
                <View style={styles.HorizontalDivCenter}>
                    <TextInput style={styles.CustomInput} placeholder="title" {...register("title")} />
                    <TextInput style={styles.CustomInput} placeholder="year" {...register("year")} />
                    <TextInput style={styles.CustomInput} placeholder="director" {...register("director")} />
                    <TextInput style={styles.CustomInput} placeholder="genre" {...register("genre")} />
                    <Button title="Search" onPress={handleSubmit(submitSearch)} />
                </View>
                <View style={styles.HorizontalDivRight}>
                    <Text>Page</Text>
                    <TextInput style={styles.CustomInputNum} placeholder="1" {...register("page")}/>
                </View>
            </View>
            
            {
            results.length > 0 ?
                <View>
                    <View style={styles.ResultTable}>
                        <View style={styles.ResultBody}>
                            <View style={styles.ResultRow}>
                                <View style={styles.ResultCell1}><Text style={styles.BoldCenteredText}>Title</Text></View>
                                <View style={styles.ResultCell23}><Text style={styles.BoldCenteredText}>Year</Text></View>
                                <View style={styles.ResultCell23}><Text style={styles.BoldCenteredText}>Director</Text></View>
                            </View>
                        {
                        results.map( result =>
                            <View style={styles.ResultRow} key={result.id}>
                                <View style={styles.ResultCell1}><Text style={styles.ResultCellText}>{result.title}</Text></View>
                                <View style={styles.ResultCell23}><Text style={styles.ResultCellText}>{result.year}</Text></View>
                                <View style={styles.ResultCell23}><Text style={styles.ResultCellText}>{result.director}</Text></View>
                            </View>
                        )
                        }
                        </View>
                    </View>
                    <View style={styles.HorizontalDivCenterDown}>
                        <Button title="prev" onPress={prevPage} />
                        <Button title="next" onPress={nextPage} />
                    </View>
                </View>
            :
                <View style={styles.HorizontalDivCenter}>
                    <View style={styles.ResultTable}>
                        <View style={styles.ResultBody}>
                            <View style={styles.ResultRow} >
                                <View style={styles.ResultCell1} >
                                    <Text style={styles.ResultCellTextCentered}>No results</Text>
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
