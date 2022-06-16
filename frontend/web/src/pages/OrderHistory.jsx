import React, { useState, useEffect } from "react";
import { useUser } from "hook/User";
import { useNavigate } from "react-router-dom";
import { View, Text } from "react-native";
import { AppStyles } from "style/Styles";
import { order_list, order_detail } from "backend/billing"

export const OrderHistory = () => {
    useEffect(() =>
        submitSearch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    , []);

    const {
        accessToken, setAccessToken
    } = useUser();

    // current page response data
    const [results, resultsSetter] = useState([]);
    const sorted = (arr) => {
        arr.sort(function (a, b) { return a.orderDate < b.orderDate });
        return arr;
    }

    const navigate = useNavigate();

    const handleResultSuccess = (response) => {
        let sales = response.data.sales;
        if (sales === undefined)
            return;
        resultsSetter([]);
        for (let i = 0; i < sales.length; ++i) {
            order_detail(accessToken, response.data.sales[i].saleId)
                .then(response1 =>
                    resultsSetter(results =>
                        sorted([...results, {
                            saleId: response.data.sales[i].saleId,
                            orderDate: response.data.sales[i].orderDate,
                            total: response.data.sales[i].total,
                            items: response1.data.items
                        }])
                    )
                );
        }

    }

    const handleException = (error) => {
        navigate("/login");
        setAccessToken(null);
    }

    const submitSearch = () => {
        order_list(accessToken)
            .then(response => handleResultSuccess(response))
            .catch(error => handleException(error))
    }

    const toDollars = (number) => {
        return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    const toDate = (date) => {
        return new Date(date).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })
    }

    return (
        <View style={AppStyles.MainDiv}>
            {
                results.length > 0 ?
                    <View style={AppStyles.ResultContainerDiv}>
                        <View style={AppStyles.ResultTable}>

                            <View style={AppStyles.ResultBody}>
                                <View style={AppStyles.ResultRow}>
                                    <View style={AppStyles.ResultCell1}><Text style={AppStyles.BoldCenteredText}>Items</Text></View>
                                    <View style={AppStyles.ResultCell23}><Text style={AppStyles.BoldCenteredText}>Date</Text></View>
                                    <View style={AppStyles.ResultCell23}><Text style={AppStyles.BoldCenteredText}>Total Price</Text></View>
                                </View>
                                {
                                    results.length > 0 && results.map(result =>
                                        <View style={AppStyles.ResultRow} key={result.saleId}>
                                            <View style={AppStyles.ResultCell1}>
                                                <View style={{ display: "flex" }}>
                                                    {result.items !== undefined && result.items.map(item =>
                                                        <Text key={item.movieId} style={AppStyles.ResultCellText}>{item.movieTitle} {item.quantity > 1 && <Text>({item.quantity})</Text>} - {toDollars(item.quantity * item.unitPrice)}</Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View style={AppStyles.ResultCell23}>
                                                <Text style={AppStyles.ResultCellText}>{toDate(result.orderDate)}</Text>
                                            </View>
                                            <View style={AppStyles.ResultCell23}>
                                                <Text style={AppStyles.ResultCellText}>{toDollars(result.total)}</Text>
                                            </View>
                                        </View>
                                    )
                                }
                            </View>
                        </View>
                    </View>
                    :
                    <Text style={AppStyles.H1Text}>You have not placed any orders.</Text>
            }
        </View>
    );
}