import {StyleSheet} from "react-native";

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

export const AppStyles = StyleSheet.create({
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