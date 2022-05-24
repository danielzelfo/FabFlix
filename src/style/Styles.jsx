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

const VerticalDivStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center"
}

export const AppStyles = StyleSheet.create({
    MainDiv: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    VerticalDiv: {
        ...VerticalDivStyle
    },
    ResultContainerDiv: {
        ...VerticalDivStyle,
        width: "calc(100% - 100px)"
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
    },
    ErrorMsg: {
        color: "red",
        width: "100%",
        textAlign: "center"
    },
    CredentialForm: {
        display: "flex",
        flexDirection: "column",
        width: "30%",
        minWidth: "300px"
    },
    MapDiv: {
        width: "60%",
        minWidth: "300px",
        marginTop: "20px"
    },
    StyledDiv: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%"
    },
    ContentDiv: {
        display: "flex",
        boxSizing: "border-box",
        width: "100%",
        minHeight: "calc(100vh - 50px)",
        padding: "25px",
        backgroundColor: "#ffffff",
        boxShadow: "inset 0 3px 5px -3px #000000"
    },
    StyledNav: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "50px",
        backgroundColor: "#fff"
    },
    MainNav: {
        position: "relative",
        left: "50%",
        transform: "translate(-50%)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "calc(100% - 10px)"
    },
    Input: {
        padding: "15px"
    },
    LogoutButton: {
        width: "80px",
        marginLeft: "-80px"
    },
    Backdrop: {
        width: "100%",
        height: "350px",
        resizeMode: "contain"
    },
    CartQuantity: {
        width: "50px", 
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "5px",
        marginLeft: "20px"
    },
    CartItems: {
        gap: "10px"
    },
    CartItem: {
        ...HorizontalDivStyle,
        justifyContent: "right",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: "5px"
    },
    HorizontalDivCart: {
        ...HorizontalDivStyle,
        justifyContent: "center",
        gap: "100px",
        padding: "20px",
        flexWrap: "wrap",
        minHeight: "calc(50vh/2)"
    },
});